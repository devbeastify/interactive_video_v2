module MaestroActivityEngine
  module ActivityParser
    class Base
      extend TagParser::XmlRuleset
      include TagParser::XmlRuleset::InstanceMethods
      include MediaItemParsing
      include PointsPerResponseParsing
      include ChildHtmlParsing

      ACCESSIBLE_REFERENCE_TYPES = %w[
        audio
        dialogue_v2
        email
        heading
        id_card
        image
        internet_keywords
        list
        model_v2
        multiple_image
        panel_group
        paragraph_v2
        social_media
        table
        video
        vocabulary_v2
        wordbank
      ].freeze

      attr_reader :warnings

      # We've got to accept a media_link argument to conform to the existing
      # inferface.
      def initialize(doc, _media_link)
        @doc = doc
        @errors = []
        @warnings = []
      end

      def structure
        return @structure if defined?(@structure)

        @structure = XmlStructure.new(@doc.at('.//items'))
        @structure.register(available_nodes)
        @structure
      end

      def content_object
        return @content_object if defined?(@content_object)

        klass = "MaestroActivityEngine::ActivityContent::#{content_object_name}"
        @content_object = klass.constantize.new(structure.registry)
      end

      def content_object_name
        self.class.name.demodulize.gsub(/Parser/, 'Content')
      end
      private :content_object_name

      def partial_name
        raise NotImplementedError
      end

      def actual_nodes
        available_nodes.select { |node| @doc.at(".//items/#{node}") }
      end

      def errors
        # Need to first retrieve any errors defined in
        # TagParser::XmlRulset::InstanceMethods
        super + @errors
      end

      def warnings
        # Like errors, we need to first retrieve any warnings defined in
        # TagParser::XmlRulset::InstanceMethods
        super + @warnings
      end

      def parse
        parse_rubric
        parse_external_rubric
        parse_title
        parse_topic
        parse_sub_topic
        parse_activity_type
        parse_dl
        parse_dl_audio
        parse_direction_line_audio
        parse_language
        parse_config
        parse_points_per_response
        parse_sidebars
        parse_overlay
        parse_external_references
        parse_inline_external_references
        parse_non_randomizable_attribute

        # Loop over each node that we've defined as a valid top-level element
        # (e.g. allows_many :headline)
        # For each accessor in the content object, we are assigning ALL of the
        # parsed objects in an array.
        sub_parser = SubDocumentParser.new(actual_nodes, content_object, @doc.at('.//items'))
        sub_parser.parse

        if @doc.at_xpath('./rubric')
          content_object.items.each do |item|
            if item.respond_to?(:points_possible=)
              item.points_possible = content_object.rubric.points_possible
            end
          end
        end
        @errors.concat(sub_parser.errors)
        @warnings.concat(sub_parser.warnings)
        content_object if @errors.empty?
      end

      private def parse_language
        # TODO: is this the right way to look for the language attribute?
        content_object.language = @doc.attributes['language'].text.downcase
        language_codes = MaestroActivityEngine::Languages.valid_activity_codes
        return if language_codes.include?(content_object.language)

        error_msg = "Invalid or missing language attribute, '#{content_object.language}'. "\
                    "Must be one of #{language_codes.sort}"
        add_error(error_msg)
      end

      private def parse_external_rubric
        selector = './external_rubric'
        return unless @doc.at(selector)

        parser = TagParser::ExternalRubric.new(@doc, selector)
        content_object.external_rubric = parser.parse&.first
      end

      private def parse_rubric
        rubric_node = @doc.at_xpath('./rubric')
        return unless rubric_node

        parser = TagParser::Rubric.new(@doc, './rubric')

        content_object.rubric = parser.parse&.first
      end

      private def parse_title
        title_node = @doc.at_xpath('./title')
        return unless title_node

        content_object.title = OpenStruct.new(text: title_node.inner_html || '')
      end

      private def parse_topic
        topic_node = @doc.at_xpath('./topic')
        return unless topic_node

        content_object.topic = OpenStruct.new(text: topic_node.inner_html || '')
      end

      private def parse_sub_topic
        sub_topic_node = @doc.at_xpath('./sub_topic')
        return unless sub_topic_node

        content_object.sub_topic = OpenStruct.new(text: sub_topic_node.inner_html || '')
      end

      private def parse_config
        parser = MaestroActivityEngine::TagParser::Config.new(@doc, '//config')
        content_object.config = parser.parse.first
        add_error(parser.errors) unless parser.errors.empty?
      end

      private def parse_activity_type
        content_object.activity_type = @doc['activity_type']
      end

      # TODO: Fix this, this is unserializable!
      private def parse_dl
        content_object.dl = validate_dl(@doc.at_xpath('./dl'), self) if content_object.dl.blank?
      end

      private def parse_direction_line_audio
        direction_line_audio_node = @doc.at_xpath('./direction_line_audio')
        return unless direction_line_audio_node

        parser = MaestroActivityEngine::TagParser::DirectionLineAudio.new(@doc, '//direction_line_audio')

        # NOTE: The media_items collection needs to be passed to the `parse`
        #       method so that the linked media item for the audio resource will
        #       be added to the list of media items for cms to publish.
        content_object.direction_line_audio = parser.parse(content_object.media_items).first
        add_error(parser.errors) unless parser.errors.empty?
      end

      private def parse_dl_audio
        dl_audio_node = @doc.at_xpath('./dl_audio')
        return unless dl_audio_node

        warn_message = 'feature has been removed. Specifying this tag ' \
          'will not have any effect on the activity.'
        deprecation_warning(
          line: dl_audio_node.line,
          old_tag: :dl_audio,
          custom_msg: warn_message
        )
      end

      private def parse_sidebars
        parser = TagParser::Sidebar.new(@doc, '//sidebar')
        content_object.sidebars = parser.parse(content_object.media_items)
      end

      private def parse_external_references
        external_references_node = @doc.at_xpath('.//external_references')
        return unless external_references_node

        parser = TagParser::ExternalReference.new(
          @doc, './/external_reference'
        )
        external_references = parser.parse(content_object.media_items)
        content_object.external_references = external_references.map(&:content)
        add_error(parser.errors) unless parser.errors.empty?
      end

      private def parse_inline_external_references
        return unless @doc.at_xpath('//inline_external_references')

        parser = TagParser::InlineExternalReference.new(
          @doc, '//inline_external_reference'
        )
        inline_external_references = parser.parse(content_object.media_items)
        content_object.inline_external_references = inline_external_references&.map(&:activity)
        add_error(parser.errors) unless parser.errors.empty?
      end

      private def parse_overlay
        overlay_node = @doc.at_xpath('./overlay')
        return unless overlay_node

        content_object.overlay = ActivityContent::Common::Overlay.new(overlay_node)
      end

      private def deprecation_warning(line:, old_tag:, new_tag: nil, custom_msg: nil)
        add_warning(
          ::MaestroActivityEngine::DeprecationWarning.new(
            line: line,
            old_tag: old_tag,
            new_tag: new_tag,
            custom_msg: custom_msg
          )
        )
      end

      private def add_warning(warning)
        warning.is_a?(Array) ? @warnings.concat(warning) : @warnings << warning
      end

      private def parse_non_randomizable_attribute
        # when the attribute is not present, default to false.
        content_object.non_randomizable = @doc['non_randomizable'].to_s == 'true'
      end

      private def add_error(message)
        message.is_a?(Array) ? @errors.concat(message) : @errors << message
      end

      def collect_errors_and_warnings(sub_parser)
        add_error(sub_parser.errors) if sub_parser.errors.present?
        add_warning(sub_parser.warnings) if sub_parser.warnings.present?
      end
    end
  end
end

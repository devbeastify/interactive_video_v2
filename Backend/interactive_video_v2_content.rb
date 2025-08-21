module MaestroActivityEngine
  module ActivityContent
    class InteractiveVideoV2Content < ActivityContent::Content
      include DirectionLineA11y
      include DirectionLineNodeTransformer
      include NodeRegistryIterable
      include QuestionAndReferenceIterable
      include RollUpA11yIssues

      attr_accessor :diagnostic, :global_intro, :quick_check, :reference, :registry, :title
      attr_reader :dl
      attr_writer :mixed_entries

      def initialize(registry = nil)
        self.registry = registry
        self.diagnostic = []
        super() # don't pass args up the chain
        @mixed_entries = nil
      end

      def a11y_issues
        roll_up_a11y_issues(
          [
            reference,
            quick_check&.map(&:quick_check_content),
            diagnostic.first
          ].flatten.compact
        ).merge(direction_line_a11y_issues(dl))
      end

      # a true value prevents attempt object from supplying blank answers for fields not submitted
      def allow_missing_answers?
        true
      end

      def custom_parser_for_node(node_name)
        case node_name
        when :diagnostic then TagParser::InteractiveVideoV2::Diagnostic
        when :global_intro then TagParser::InteractiveVideoV2::GlobalIntro
        end
      end

      def diagnostic_feedback?
        true
      end

      def dl=(node)
        return if node.nil?

        @dl = expand_direction_line_tags(node.dup)
      end

      def effective_ruleset(scoring_ruleset)
        scoring_ruleset.must_match_accents = true if requires_accents?
        scoring_ruleset.must_match_capitalization = true if requires_capitalization?
        scoring_ruleset.must_match_punctuation = true if requires_punctuation?

        scoring_ruleset
      end

      def global_intro
        (@global_intro || []).first
      end

      def topic
        global_intro&.topic
      end

      def sub_topic
        global_intro&.sub_topic
      end

      def has_diagnostic?
        diagnostic.present?
      end

      def has_points?
        true
      end

      def mixed_entries
        @mixed_entries ||= each_excluding_nodes(%w[diagnostic global_intro]).map do |index, node|
          send(node.name)[index]
        end
      end

      def points_possible
        1
      end

      def randomizable?
        false
      end

      def progress_bar_elements
        quick_check_index = 0
        video_index = 0

        mixed_entries.map.with_index do |action, index|
          case action
          when ActivityContent::Reference::Video
            {
              action_type: 'button',
              event_data: { elementIndex: index },
              is_current: false,
              is_enabled: false,
              label: "Video #{video_index += 1}",
              url: ''
            }
          when ActivityContent::InteractiveVideoV2::QuickCheck
            {
              action_type: 'button',
              event_data: { elementIndex: index },
              is_current: false,
              is_enabled: false,
              label: "Quick Check #{quick_check_index += 1}",
              url: ''
            }
          end
        end
      end

      def requires_accents?
        diagnostic.first&.style&.require_accents?
      end

      def requires_capitalization?
        diagnostic.first&.style&.require_capitalization?
      end

      def requires_punctuation?
        diagnostic.first&.style&.require_punctuation?
      end

      def reviewable_by_all_questions?
        has_diagnostic?
      end

      def serialize
        {
          diagnostic: diagnostic.first&.serialize,
          dl: dl&.inner_html || '',
          mixed_entries: mixed_entries.map(&:serialize),
          title: title,
          global_intro: global_intro&.serialize,
          video_references: video_references.map(&:serialize),
          quick_checks: quick_checks.map(&:serialize)
        }.to_json
      end

      def quick_checks
        @quick_checks ||= parse_quick_checks_from_xml
      end

      def parse_quick_checks_from_xml
        # Parse the XML for different quick check types (category matching, drag-and-drop, etc.)
      end
    end
  end
end

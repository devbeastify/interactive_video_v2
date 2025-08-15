module MaestroActivityEngine
  module ActivityContent
    class InteractiveVideoV2Content < ActivityContent::Content
      include DirectionLineA11y
      include DirectionLineNodeTransformer
      include NodeRegistryIterable
      include RollUpA11yIssues
      include QuestionAndReferenceIterable

      attr_accessor :diagnostic, :quick_check, :reference, :registry, :title, :topic, :sub_topic
      attr_reader :dl

      def initialize(registry = nil)
        self.registry = registry
        self.diagnostic = []
        super() # don't pass args up the chain
        @mixed_entries = nil
      end

      def attributes
        super + %i[diagnostic quick_check reference]
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
      # The diagnostic form contains only a subset of the total question set.
      def allow_missing_answers?
        true
      end

      def custom_parser_for_node(node_name)
        case node_name
        when :diagnostic then TagParser::InteractiveVideoV2::Diagnostic
        end
      end

      # The diagnostic portion is submitted for correction via ajax
      def diagnostic_feedback?
        true
      end

      def dl=(node)
        return if node.nil?

        @dl = expand_direction_line_tags(node.dup)
      end

      def effective_ruleset(scoring_ruleset)
        # only change the ruleset settings to true if the activity requires it.
        scoring_ruleset.must_match_accents = true if requires_accents?
        scoring_ruleset.must_match_capitalization = true if requires_capitalization?
        scoring_ruleset.must_match_punctuation = true if requires_punctuation?

        scoring_ruleset
      end

      def has_diagnostic?
        diagnostic.present?
      end

      def has_points?
        true
      end

      def mixed_entries
        @mixed_entries ||= each_excluding_nodes(['diagnostic']).map do |index, node|
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
          topic: topic&.text || '',
          sub_topic: sub_topic&.text || '',
          title: title&.text || '',
          dl: dl&.inner_html || '',
          quick_checks: (quick_check&.map(&:serialize) || []),
          reference: reference.map(&:serialize)
        }.to_json
      end

      def show_answer_key?
        false
      end

      def submittable?
        false
      end

      def validate_responses(
        params, # student responses
        scoring_ruleset, # strictness rules
        mode = :submitted, # should be :submitted
        disable_enhanced_feedback = false, # correction feedback level
        feedback_items = [] # should be an empty array for this activity
      )
        diagnostic.first&.validate_responses(
          params,
          effective_ruleset(scoring_ruleset),
          mode,
          disable_enhanced_feedback,
          feedback_items
        )
      end
    end
  end
end

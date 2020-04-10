'use strict';

var propertiesSetup = {
    'challenges': {
        'label': 'Challenges',
        'opts': [
            {
                'name': 'quiz_questions_shuffle',
                'label': 'Shuffle questions.',
                'value': false
            }, {
                'name': 'quiz_answers_shuffle',
                'label': 'Shuffle available answers.',
                'value': true
            }, {
                'name': 'quiz_questions_use_all',
                'label': 'Use all available questions. <span class="badge badge-primary">New</span>',
                'value': false
            }, {
                'name': 'quiz_questions_skip_ignored',
                'label': 'Skip invalid or ignored questions.',
                'value': true
            }
        ]
    },
    'app': {
        'label': 'Application and UI',
        'opts': [
            {
                'name': 'app_ui_introduction_enabled',
                'label': 'Watch introdution everytime.',
                'value': true
            }, {
                'name': 'app_ui_animation_before_result',
                'label': 'Watch animation before displaying exam result.',
                'value': true
            }, {
                'name': 'app_ui_start_challenge_after_load_success',
                'label': 'Start challenge after successfully loading questions from file. Print mode cannot be used.',
                'value': false
            }, {
                'name': 'app_ui_start_challenge_after_download_success',
                'label': 'Start challenge after successfully downloading questions from internet. Print mode cannot be used.',
                'value': false
            }, {
                'name': 'app_ui_start_challenge_after_selecting',
                'label': 'Start challenge after selecting. Print mode cannot be used.',
                'value': false
            }, {
                'name': 'quiz_questions_mark_for_review',
                'label': 'Allow marking questions for review. <span class="badge badge-primary">New</span>',
                'value': false
            }, {
                'name': 'quiz_answers_help_button',
                'label': 'Allow using Help button during challenges.',
                'value': true
            }, {
                'name': 'app_ui_display_nav_below_questions',
                'label': 'Display additional navigation below questions. <span class="badge badge-primary">New</span>',
                'value': false
            }, {
                'name': 'quiz_answers_print_letters',
                'label': 'Display letters before answers.',
                'value': false,
                'state': 'enabled'
            }, {
                'name': 'app_ui_display_progress',
                'label': 'Display progress bar during challenge.',
                'value': true
            }, {
                'name': 'app_ui_display_timer',
                'label': 'Display time during challenge.',
                'value': true
            }
        ]
    },
    'print': {
        'label': 'Print mode',
        'opts': [
            {
                'name': 'print_questions_skip_ignored',
                'label': 'Skip invalid or marked as ignored questions.',
                'value': true
            }, {
                'name': 'print_answers_print_incorrect',
                'label': 'Print incorrect (less visible) answers',
                'value': false
            }
        ]
    }
};
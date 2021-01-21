# LearnWise

Application for learning on exams. __LearnWise__ displays questions from text file, stores loaded one in localStorage, counts time for exam, presents correct and wrong answers, and many others. Check it latest working version.

[LearnWise](https://lukasz-jakub-adamczuk.github.io/codemarker/)

## File format

Exam file is written in plain text file, but in special format. It's possible to define various type of questions. Let's see how configure simple question with anwser:
```
This is simple question
+ correct answer starts with + (plus) character
- incorrect answer starts with - (minus) character
```

Each question can have one or many correct answers, same with incorrect one. There is no limits, otherwise you define it as param, but this more advanced setup. For now it's important to know that question with multiple answers will be rendered in different way. Look for next example:
```
This is other simple question
+ correct answer
- incorrect answer
+ second correct answer
- second incorrect answer
```

Order of answers does not matter. Only matters to start each answer with `+` (plus) or `-` (minus) character. Each question must be separated with at least one new empty line:
```
Here you have first question
+ correct answer
- incorrect answer

Here you have second question
+ correct answer
- incorrect answer
```

Question can be defined as multiline. When question has started then all written in next lines until first answer or params (will be explained later) will be treated as one question. Example below should be clear enough:
```
Here you have first line of question.

Next line one can be splitted with new empty line or not.
This is completely your decision.
+ correct answer
- incorrect answer
```

Question and answers will be truncated anyway and displayed and HTML. Any additional spaces will be ignored too. Keeping proposed format makes whole exam file more readable. Look on this awful example:
```
            This question is indented, but it will be ignored by application
+Answer can start directly after + (plus) character
+ But with additional space looks much better
-       Number of spaces doesn't matter again
```

It's not mandatory to define answers, but question without answers will be ignored. Parser expects question and answer, params optionally. Until params or answers will be found all rest is treated as one question. Example below has been prepared as question without answers and question without correct anwsers. Finally will be parsed as one multi-line question with no correct answer. System will mark it as `ignored`.
```
This question has no answers

This has no correct answers
- Choose this
- Choose that
```

If you are not sure about correct answer or answers for given question just mark it as `ignored` manually. This is where params useful. To define such element you need to use JSON object between question and answers, generally. Params starts with `{` (opening curly bracket) character and ends with `}` (closing curly bracket) character. All between are params divided with (`,`) comma character. Each param has *<key>* and *<value>* which need to enclosed with `"` double quotation mark and divided with `:` (colon) character. It's only sounds complicated:
```
This question will be ignored
{"status": "ignored"}
+ correct answer
- incorrect answer
```

If you want to add some comment for a question there is dedicated param supported in application. Such comments can contain plain text or markdown which will formated as HTML during displaying questions. Comment can be configured with `comment` param and its value which will be presented in modal window. You can find example of question with comment below:
```
This question has a comment which could be useful
{"comment": "This text could be very useful and explain some technical aspects related question and answers. It could has additionally [link to documentation](https://github.com/lukasz-jakub-adamczuk/codemarker#learnwise) or any other resource in internet."}
+ correct answer
- incorrect answer
```

Params as JSON object can be defined in multiple lines for better readability. Each param will be parsed with no differences although has been written in multi-lines.
```
Question with params in multi-line version:
{
    "area": "test",
    "comment": "This will be comment for question"
}
+ correct answer
- incorrect answer
```

Markdown is supported in questions and answers. This could be useful to emphasize context of question. You can format text in plain text using special characters, which will be replaced after parsing with HTML tags. If you interested how to use just check multiple resources in internet. For example [markdown cheat sheet](https://www.markdownguide.org/cheat-sheet/).
```
Question with _italic_ and __bold__ content:
+ __correct__ answer
- incorrect answer
```

Full list of supported params has been listed below. There is more params which can be used to define complex question types. Here is list of all suppoerted params:
- `"area": "any string"` - Defines what the question concerns. Value displayed in question header.
- `"status": "ignored"` - Question will be ignored. Status added automatically when question has no correct anwser or answers at all.
- `"type": "single"` - Added automatically to each question with single correct answer.
- `"type": "multiple"` - Added automatically to each question with multiple correct answers.
- `"type": "input"` - Defines question where answer or answers must be typed. Correct answer or anwsers are needed still.
- `"type": "matching"` - Defines question where answers must be matched. Each answer must be correct and has `==` (two equal signs) inside, splitting whole anwser on two parts.
- `"answers": "3"` - Defines how many answers must be selected in question. Applicable for `multiple` type question only.
- `"comment": "any text"` - Adds additional comment for the question. Markdown is supported. Comment will displayed in modal window triggered with button.
- `"image": "url to image"` - Defines image for the question. Image will be displayed in modal window triggered with buttom.

What is missing in file format
- [ ] Support for multiline answers
- [ ] Multi-line params definition

## Sample exam file
[Check sample-exam](https://raw.githubusercontent.com/lukasz-jakub-adamczuk/codemarker/master/sample-exam.md) file which can be saved locally and loaded in application. Open this exam and experiment with own questions to see how easily this can be done.

## Excel template

Exam template is written in Excel spreadsheet. There is few advantages for this method. First you don't need to use special format, so creating questions for people might be easier. Second you can load multiple exams at the same time. You need to follow some basic rules still.

Valid question need 3 elements. Content for question have to be written in column B with header Question. Answers available for selection have to listed in column C with header Options. Notice that each answer need to be prefixed with letter and parenthis. Last condition says that answer need to be defined in column D with header Answer, unless this is match type question.

More about available options in Excel template.

Column A with header Lp. can be used for questions numbering, but it's not necessary. Value will be displayed with question in modal window.

Column E with header Notes can be used for any comments related question or given answers. Value will be displayed with question in modal window

Column F with header Version is used for specifing version of questions. Value might be used for filtering and will be displayed above question depending on user settings.

Column G with header Image is used for specifing image in remote location or other params related question which defines application bahaviour in this case.

Column H with heaser Tags is used for specifing area for the question. Value might be used for filtering and will be displayed above question depending on user settings.

## Sample exam template
[Check sample-template](https://raw.githubusercontent.com/lukasz-jakub-adamczuk/codemarker/master/sample-exam.xlsx) file which can be uploaded in application. Open this exam and experiment with own questions to see how easily this can be done.


## TODO
- [ ] display timer based on param
- [ ] configurable prev and next buttons for left/right edge if screen (mobile)
- [ ] collect questions answered wrong and use again
- [ ] pause challenge
- [ ] pwa
- [ ] rwd
- [ ] use all available questions option
- [ ] write tests
- [ ] support for dropdown questions
- [ ] displays letters before answers
- [ ] complete file parsing errors handling

## TOFIX
- [ ] prev and next after time ended

## Changelogs

### v0.15
- [x] parsing questions from Excel spreadsheet
- [x] parsing timestamp for exam on list
- [x] percentage count for valid quiestions

### v0.14
- [x] fix for shuffling questions
- [x] filtering questions with versions and tags
- [x] demo exam for beginners
- [x] download exam locally
- [x] confirmation before deleting exam


### v0.13
- [x] versions and tags depending property
- [x] filtering questions with options

### v0.12
- [x] next question after positive feedback feature
- [x] fixed translations for modals
- [x] filtering visible, but disabled still
- [x] fix for timer running out
- [x] fix for progress bar calculation when using C key
- [x] fix for letters in print mode
- [x] user change for language, theme and annotations visible in UI
- [x] fix for existing help button

### v0.11
- [x] instant feedback
- [x] positive and negatiove audio feedback
- [x] enable new features without reset settings
- [x] new features label based on version
- [x] features depending on version
- [x] animated progress bar

### v0.10
- [x] support for translations
- [x] support for UI theme
- [x] annotations in menu

### v0.09
- [x] extending print mode for question new types
- [x] matching type question support
- [x] input type question support
- [x] errors handling for answers in matching question
- [x] comment param support
- [x] image param support
- [x] answers params support
- [x] markdown support in questions and answers
- [x] properties handling
- [x] display progress bar during challenge property handling

### v0.08
- [x] redesign and extend show result view
- [x] navigation by keys works any time
- [x] click on challenge div (not answer) causes error
- [x] too many questions counted for exam when selected exam (parsed indeed) and then loaded another (parsing new one without reset parser)
- [x] swipe support on mobile
- [x] show wrong questions after submitting
- [x] support for text input in questions
- [x] support for images in questions
- [x] support for dropdown or match available answers
- [x] support for param shuffle
- [x] support for param answers
- [x] support for param comment
- [x] deleting exams from list
- [x] reset to default settings

### v0.07
- [x] extending print mode for question new types
- [x] matching type question support
- [x] input type question support
- [x] errors handling for answers in matching question
- [x] comment param support
- [x] image param support
- [x] answers params support
- [x] markdown support in questions and answers
- [x] properties handling
- [x] display progress bar during challenge property handling

### v0.06
- [x] print mode
- [x] support for configuration properties
- [x] scrollable questions, available exams, options
- [x] favicon
- [x] splash screen
- [x] favicon
- [x] reorganize code
- [x] file parsing errors handling (header only)

### v0.05
- [x] verify what answer was checked/unchecked during question

### v0.04
- [x] ~~decrease font when question or answers are too long~~
- [x] move exam initials to questions file
- [x] enabling to choose stored exams on front page

### v0.03
- [x] parsing question parameters
- [x] show final result
- [x] slugify function modification
- [x] support for param area

### v0.02
- [x] show correct answer on questions
- [x] one incorrect answer in multiple answers question is 0 points
- [x] retry challenge

### v0.01
- [x] initial working application

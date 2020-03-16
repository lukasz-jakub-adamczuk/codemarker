# LearnWise

Application for learning on exams. __LearnWise__ displays questions from text file, stores loaded one in localStorage, counts time for exam, presents correct and wrong answers, and many others. Check it latest working version.

[LearnWise](https://lukasz-jakub-adamczuk.github.io/codemarker/)

## File format

Exam file is written in plain text file, but in special format. It's possible to define various type of questions. Let's see how configure simple question with anwser:
```
This is simple question
+ correct answer starts with + character
- incorrect answer starts with - character
```

Each question can have one or many correct answers, same with incorrect one. There is no limits, otherwise you define it as param, but this more advanced setup. For now it's important to know that question with multiple answers will be rendered in different way. Look for next example:
```
This is other simple question
+ correct answer starts with + character
- incorrect answer starts with - character
+ second correct answer
- one more incorrect answer
```

Order of answers does not matter. Only matters to start each answer with `+` (plus) or `-` (minus) character. Each question must be separated with at least one new empty line:
```
Here you have first question
+ correct answer starts with + character
- incorrect answer starts with - character

Here you have second question
+ correct answer starts with + character
- incorrect answer starts with - character
```

Question can be defined as multiline. When question has started then all written in next lines until first answer or params (will be explained later) will be treated as one question. Example below should be clear enough:
```
Here you have first line of question.

Next line one can be splitted with new empty line or not.
This is completely your decision.
+ correct answer starts with + character
- incorrect answer starts with - character
```

Question and answers will be truncated anyway and displayed and HTML. Any additional spaces will be ignored too. Keeping proposed format makes whole exam file more readable. Look on this awful example:
```
            This question is indented, but it will be ignored by application
+Answer can start directly after + character
+ But with additional space looks much better
-       Number of spaces doesn't matter again
```

It's not mandatory to define answers. Question without answers will be marked as `incomplete`. Exactly the same will be when all available answers will be incorrect.
```
This question has no answers

This has no correct answers
- Choose this
- Choose that
```

If you are not sure about correct answer or answers for given question just mark it as `incomplete` manually. This is where params useful. To define such element you need to use JSON object between question and answers, generally. Params starts with `{` (opening curly bracket) character and ends with `}` (closing curly bracket) character. All between are params divided with (`,`) comma character. Each param has *<key>* and *<value>* which need to enclosed with `"` double quotation mark and divided with `:` colon character. It's only sounds complicated:
```
This question will be ignored
{"status": "incomplete"}
+ correct answer starts with + character
- incorrect answer starts with - character
```

There is more params which can be used to define complex question types. Here is list of all suppoerted params:
- `"area": "any string"` - Defines what the question concerns. Value displayed in question header.
- `"status": "incomplete"` - Question will be ignored. Status added automatically when question has no correct anwser or answers at all.
- `"type": "single"` - Added automatically to each question with single correct answer.
- `"type": "multiple"` - Added automatically to each question with multiple correct answers.
- `"type": "input"` - Defines question where answer or answers must be typed. Correct answer or anwsers are needed still.
- `"type": "matching"` - Defines question where answers must be matched. Each answer must be correct and has `==` (two equal signs) inside, splitting whole anser on two parts.
- `"type": "answers"` - Defines how many answers must be selected in question. Applicable for `multiple` type question only.
- `"type": "comment"` - Adds addional comment for the question.

```
This question will be ignored
{"status": "incomplete"}
+ correct answer starts with + character
- incorrect answer starts with - character
```

What is missing in file format
- [ ] Support for multiline answers
- [ ] Multi-line params definition

Download sample-exam file, load in application and check how questions have been displayed. Experiment with own questions.

## TODO

- [ ] collect questions answered wrong and use again
- [ ] pause challenge
- [ ] pwa
- [ ] rwd
- [ ] use all available questions option
- [ ] swipe support on mobile
- [ ] show wrong questions after submitting
- [ ] write tests
- [ ] support for text input in questions
- [ ] support for images in questions
- [ ] support for dropdown or match available answers
- [ ] support for param shuffle
- [x] support for param answers (nothing to do)
- [ ] support for param comment
- [ ] displays letters before answers
- [] complete file parsing errors handling

## TOFIX
- [ ] prev and next after time ended

## Changelogs
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
- [x] decrese font when question or answers are too long
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

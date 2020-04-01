# exam:         sample-exam
# description:  Sample exam to present possible questions types

This is simple question
+ correct answer starts with + (plus) character
- incorrect answer starts with - (minus) character

This is other simple question
+ correct answer
- incorrect answer
+ second correct answer
- second incorrect answer

Here you have first question
+ correct answer
- incorrect answer

Here you have second question
+ correct answer
- incorrect answer

Here you have first line of question.

Next line one can be splitted with new empty line or not.
This is completely your decision.

+ correct answer
- incorrect answer

            This question is indented, but it will be ignored by application
+Answer can start directly after + (plus) character
+ But with additional space looks much better
-       Number of spaces doesn't matter again

This question has no answers

This has no correct answers
- Choose this
- Choose that

This question will be ignored
{"status": "ignored"}
+ correct answer
- incorrect answer

This question has a comment which could be useful
{"comment": "This text could be very useful and explain some technical aspects related question and answers. It could has additionally [link to documentation](https://github.com/lukasz-jakub-adamczuk/codemarker#learnwise) or any other resource in internet."}
+ correct answer
- incorrect answer

Question with params in multi-line version:
{
    "area": "test",
    "comment": "This will be comment for question"
}
+ correct answer
- incorrect answer

Question with _italic_ and __bold__ content:
+ __correct__ answer
- incorrect answer
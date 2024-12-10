import React from 'react';

const QuestionEditor = ({ editorQuestions, setEditorQuestions, removeQuestion }) => {
  const updateQuestionField = (index, field, value) => {
    const updatedQuestions = [...editorQuestions];
    updatedQuestions[index][field] = value;
    setEditorQuestions(updatedQuestions);
  };

  const addQuestionPart = (index) => {
    const updatedQuestions = [...editorQuestions];
    const partChar = String.fromCharCode(97 + updatedQuestions[index].parts.length); // `(a)`, `(b)`
    updatedQuestions[index].parts.push({ part: partChar, text: '' });
    setEditorQuestions(updatedQuestions);
  };

  const updateQuestionPart = (qIndex, partIndex, text) => {
    const updatedQuestions = [...editorQuestions];
    updatedQuestions[qIndex].parts[partIndex].text = text;
    setEditorQuestions(updatedQuestions);
  };

  return (
    <>
      {editorQuestions.map((question, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg">
          <div className="mb-2 flex items-center space-x-4">
            <input
              type="text"
              placeholder="SLN"
              value={question.sln}
              onChange={(e) => updateQuestionField(index, 'sln', e.target.value)}
              className="w-16 p-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Outcome"
              value={question.outcome}
              onChange={(e) =>
                updateQuestionField(index, 'outcome', e.target.value)
              }
              className="w-32 p-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Marks"
              value={question.marks}
              onChange={(e) => updateQuestionField(index, 'marks', e.target.value)}
              className="w-16 p-2 border rounded-lg"
            />
            <button
              onClick={() => removeQuestion(index)}
              className="py-1 px-3 bg-red-600 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
          <textarea
            placeholder="Enter question text"
            value={question.question}
            onChange={(e) =>
              updateQuestionField(index, 'question', e.target.value)
            }
            rows="2"
            className="w-full p-2 border rounded-lg mb-2"
          />
          <button
            onClick={() => addQuestionPart(index)}
            className="py-1 px-4 mb-2 bg-blue-600 text-white rounded-lg"
          >
            Add Sub-Part
          </button>
          {question.parts.map((part, partIndex) => (
            <div key={partIndex} className="ml-4">
              <input
                type="text"
                placeholder={`${part.part})`}
                value={part.text}
                onChange={(e) =>
                  updateQuestionPart(index, partIndex, e.target.value)
                }
                className="w-full p-2 border rounded-lg mb-2"
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default QuestionEditor;

import React from 'react';

const HeaderFooterEditor = ({
  headerFields,
  setHeaderFields,
  footerFields,
  setFooterFields,
  newFooterField,
  setNewFooterField,
}) => {
  const addFooterField = () => {
    if (newFooterField.trim()) {
      setFooterFields([...footerFields, newFooterField]);
      setNewFooterField('');
    }
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-bold mb-2">Header Information</h2>
        <input
          type="text"
          placeholder="University Name"
          className="w-full mb-2 p-2 border rounded-lg"
          value={headerFields.universityName}
          onChange={(e) =>
            setHeaderFields({ ...headerFields, universityName: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Department"
          className="w-full mb-2 p-2 border rounded-lg"
          value={headerFields.department}
          onChange={(e) =>
            setHeaderFields({ ...headerFields, department: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Exam Name"
          className="w-full mb-2 p-2 border rounded-lg"
          value={headerFields.examName}
          onChange={(e) =>
            setHeaderFields({ ...headerFields, examName: e.target.value })
          }
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h2 className="text-lg font-bold mb-2">Footer Information</h2>
        <ul className="mb-4">
          {footerFields.map((field, index) => (
            <li key={index} className="text-sm bg-gray-100 p-2 rounded-lg mb-2">
              {field}
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add Footer Field"
          className="w-full mb-2 p-2 border rounded-lg"
          value={newFooterField}
          onChange={(e) => setNewFooterField(e.target.value)}
        />
        <button
          onClick={addFooterField}
          className="w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Add Footer Field
        </button>
      </div>
    </>
  );
};

export default HeaderFooterEditor;

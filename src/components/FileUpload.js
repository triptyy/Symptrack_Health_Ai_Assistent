import React, { useState } from "react";

function FileUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };


  const handleUpload = () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    alert(`Uploading: ${file.name}`);
  };

  
  return (
    <div className="file-upload">
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Report</button>
    </div>
  );
}

export default FileUpload;



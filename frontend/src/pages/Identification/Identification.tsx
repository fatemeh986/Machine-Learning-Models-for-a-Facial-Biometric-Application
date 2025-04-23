// import "./home.scss";
import { useState, useRef } from "react";

const Identification = () => {
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [identificationResult, setIdentificationResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleImageUpload = (e:React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadImage(file);
      setIdentificationResult("");
    }
  };

  const handleChooseImageClick = () => {
    fileInputRef.current?.click();
  };


  const handleIdentifyClick = async () => {
    if (!uploadImage) {
      setIdentificationResult("Please upload an image first!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("uploadImage", uploadImage);

      const response = await fetch("http://localhost:21100/api/identify/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("identification failed");
      const data = await response.json();
      setIdentificationResult(data.identified_as === "Unknown"
        ? "Not Identified"
        : `Identified as ${data.identified_as}`);
    } catch (error) {
      setIdentificationResult("Error during identification");
      console.error(error);
    }     
  };
  

  return (
    <div className="home">
      <div className="box box2">
        <h3>
        <button onClick={handleChooseImageClick} className="choose-btn"> Choose Image</button>
        </h3>
        <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="file-input"
            style={{display:"none"}}
          />
          
          {uploadImage && (
            <img 
              src={URL.createObjectURL(uploadImage)} 
              alt="Uploaded"
              className="image-preview" />
          )}
      </div>
      <div>
          <button onClick={handleIdentifyClick} className="verify-btn">Identify</button>
          {identificationResult && (
            <p className={`result ${identificationResult !== "Not Identified" ? "verified" : "not-verified"}`}>
              {identificationResult}
            </p>
          )}
      </div>
      
    </div>
  );
};

export default Identification;

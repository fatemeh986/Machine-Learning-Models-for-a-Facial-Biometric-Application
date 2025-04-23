
import "./verification.scss";
import { useState, useRef, useEffect } from "react";

const Home = () => {
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // default image for verification
  const [defaultImage, setDefaultImage] = useState('')

  useEffect(() => {
    fetch("http://localhost:21100/api/default_img/")
    .then(response => response.json())
    .then(data => setDefaultImage(data.url))
    .catch(error => console.error("Error fetching default image: ", error));
  },[]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadImage(file);
      setVerificationResult("");
    }
  };

  const handleChooseImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleVerifyClick = async () => {
    if (!uploadImage) {
      setVerificationResult("Please upload an image first!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("uploadImage", uploadImage);

      const response = await fetch("http://localhost:21100/api/verify/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Verification failed");
      const data = await response.json();
      console.log("Verification response: ", data);

      setVerificationResult(data.verified ? "Verified" : "Not Verified");
    } catch (error) {
      setVerificationResult("Error during verification");
      console.error(error);
    }
  };



  return (
    <div className="home">
      <div className="box">
        <h3>Default Image</h3>
        <img 
          src={defaultImage} 
          alt="Default"
          className="image-preview"
          onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')} 
        />
      </div>

      {/* Upload Image Card */}
      <div className="box box2">
        <h3> <button onClick={handleChooseImageClick} className="choose-btn">
          Choose Image
        </button></h3>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="file-input"
          style={{ display: "none" }}
        />
        
        {uploadImage && (
          <img 
            src={URL.createObjectURL(uploadImage)} 
            alt="Uploaded"
            className="image-preview" 
          />
        )}
      </div>

      {/* Verify Button Outside the Upload Card */}
      <div className="verify-container">
        <button onClick={handleVerifyClick} className="verify-btn">
          Verify
        </button>
        {verificationResult && (
          <p className={`result ${verificationResult === "Verified" ? "verified" : "not-verified"}`}>
            {verificationResult}
          </p>
        )}
      </div>
    </div>

  );
};

export default Home;

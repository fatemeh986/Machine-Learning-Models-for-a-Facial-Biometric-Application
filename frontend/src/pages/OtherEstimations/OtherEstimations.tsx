import { useState, useRef } from "react";

const OtherEstimations = () => {
  const [uploadImage, setUploadImage] = useState<File|null>(null);
  const [ageResult, setAgeResult]       = useState<string>("");
  const [genderResult, setGenderResult] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadImage(f);
      setAgeResult("");
      setGenderResult("");
    }
  };

  const handleChooseImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleEstimateClick = async () => {
    if (!uploadImage) {
      setAgeResult("Please upload an image first!");
      setGenderResult("");
      return;
    }

    const formData = new FormData();
    formData.append("image", uploadImage);             

    try {
      const res = await fetch("http://localhost:21100/api/estimate_age_gender/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Estimation failed");
      const data = await res.json();
      setAgeResult(`Age: ${data.age ?? "Unknown"} years`);
      setGenderResult(`Gender: ${data.gender}`);
    } catch (err) {
      console.error(err);
      setAgeResult("Error during estimation");
      setGenderResult("");
    }
  };

  return (
    <div className="home">
      <div className="box box2">
        <h3>
          Upload Image:&nbsp;
          <button onClick={handleChooseImageClick} className="choose-btn">
            Choose Image
          </button>
        </h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: "none" }}
        />
        {uploadImage && (
          <img
            src={URL.createObjectURL(uploadImage)}
            alt="Preview"
            className="image-preview"
          />
        )}
      </div>
      <div>
        <button onClick={handleEstimateClick} className="verify-btn">
          Estimate
        </button>
        {ageResult && <p className="result">{ageResult}</p>}
        {genderResult && <p className="result">{genderResult}</p>}
      </div>
    </div>
  );
};

export default OtherEstimations;

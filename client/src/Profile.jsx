import React, { useState } from "react";
import "./ProfileSetup.css";

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    profilePhoto: null,
    bio: "",
    password: "",
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePhoto: e.target.files[0] });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep((e) => e + 1);
  };

  return (
    <div className="profile-setup-container">
      <div className="card">
        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>

        {/* Form Steps */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentStep(currentStep + 1);
          }}
        >
          {currentStep === 1 && (
            <div className="form-step">
              <h2>Step 1: Profile Setup</h2>
              <div>
                <div>
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="profilePhoto">Profile Photo</label>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <h2>Step 2: Bio</h2>
              <div>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="form-step">
              <h2>Step 3: Password</h2>
              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="button-group">
            {currentStep > 1 && (
              <button type="button" onClick={handlePrev}>
                Previous
              </button>
            )}
            {currentStep < 3 ? (
              <button type="button" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button type="submit" onClick={handleSubmit}>
                Submit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;

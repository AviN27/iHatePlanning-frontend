"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "../create/create.css";

const CreatePlanner = ({ user }) => {
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [hyperlinks, setHyperlinks] = useState("");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const [modal, setModal] = useState(false);

  const [editLoader, setEditLoader] = useState(false);

  useEffect(() => {
    if (user?.app_metadata?.provider !== "email") {
      const fullName = user?.user_metadata?.name;
      const firstNameSplit = fullName?.split(" ")[0] || "User";
      setFirstName(firstNameSplit);
    } else {
      setFirstName(user?.user_metadata?.display_name || "User");
    }
    setEmail(user?.email);
  }, [user]);

  useEffect(() => {
    const fetchPlansForUpdate = async () => {
      try {
        setEditLoader(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans/id/${planId}`
        );
        const data = await response.json();
        setTitle(data[0]?.planData?.title);
        setDescription(data[0]?.planData?.description);
        setLocation(data[0]?.planData?.location);
        setDate(data[0]?.planData?.date);
        setHyperlinks(data[0]?.planData?.links);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setEditLoader(false);
      }
    };

    if (planId) {
      fetchPlansForUpdate();
    }
  }, [planId]);

  useEffect(() => {
    if (modal) {
      document.body.classList.add("active-modal");
    } else {
      document.body.classList.remove("active-modal");
    }
  }, [modal]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleHyperlinksChange = (e) => {
    setHyperlinks(e.target.value);
  };

  const toggleModal = () => {
    setModal(!modal);
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = date.getUTCDate();
    const month = date.getUTCMonth(); // This will return 0 for January, 1 for February, etc.
    const year = date.getUTCFullYear();

    function getOrdinal(n) {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    }
    const formattedDate = `${getOrdinal(day)} of ${
      months[month]
    }, ${date.toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC",
    })}`;

    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours) as 12 AM

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    const time = `${hours}:${formattedMinutes} ${ampm}`;
    const finalFormattedDate = `${formattedDate} at ${time}`;

    return finalFormattedDate;
  }

  const refreshAccessToken = async () => {

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_API_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_API_CLIENT_SECRET,
        refresh_token: process.env.NEXT_PUBLIC_GOOGLE_API_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();
    if (response.ok) {
      // Update the access token
      return data;

      // Optionally, store the new access token in your database or environment variable store
    } else {
      console.error("Failed to refresh access token:", data);
    }
  };

  const createCalendarEvent = async () => {
    let eventDate = new Date(date).toISOString();
    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: eventDate,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: eventDate,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    // Refresh the access token
    console.log("REFRESHING ACCESS TOKEN");
    const accessTokenData = await refreshAccessToken();

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer " + accessTokenData.access_token,
          },
          body: JSON.stringify(event),
        }
      )
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          console.log(data);
          console.log("Google Event created successfully");
        });
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans/${planId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            name: firstName,
            planData: {
              title: title,
              date: date,
              description: description,
              links: hyperlinks,
              location: location,
            },
          }),
        }
      );

      if (response.ok) {
        console.log("Plan updated successfully");
        setTitle("");
        setDescription("");
        setLocation("");
        setDate("");
        setHyperlinks("");
        toggleModal();
      } else {
        console.error("Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleSubmit = async (e) => {
    console.log(user);
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            name: firstName,
            planData: {
              title: title,
              date: date,
              description: description,
              links: hyperlinks,
              location: location,
              completed: "No",
            },
          }),
        }
      );

      if (response.ok) {
        if (user?.app_metadata?.provider !== "email") {
          createCalendarEvent();
        }
        console.log("Plan created successfully");
        setTitle("");
        setDescription("");
        setLocation("");
        setDate("");
        setHyperlinks("");
        toggleModal();
      } else {
        console.error("Failed to create plan");
      }
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  return (
    <main>
      {modal && (
        <div className="modal">
          <div onClick={toggleModal} className="overlay"></div>
          <div className="modal-content">
            {planId ? (
              <h2 className="modal-title">Plan updated!</h2>
            ) : (
              <h2 className="modal-title">Plan created!</h2>
            )}
            <a href="/planner">
              <button className="close-modal" onClick={toggleModal}>
                View your planned future.
              </button>
            </a>
          </div>
        </div>
      )}

      {editLoader && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!editLoader && (
        <div className="title-area">
          {planId ? "Edit your future here?" : "Plan your future here."}
        </div>
      )}

      {!editLoader && (
        <div className="form-area">
        <div className="card">
          <form
            className="form"
            onSubmit={planId ? handleUpdate : handleSubmit}
          >
            <div className="inputs">
              <span className="title-text">Title</span>
              <input
                maxLength={20}
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="create_input"
                required={true}
              />
            </div>
            <div className="inputs">
              <span className="title-text">Description</span>
              <textarea
                maxLength={40}
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={handleDescriptionChange}
                className="create_input"
                required=""
              />
            </div>
            <div className="inputs">
              <span className="title-text">Location</span>
              <input
                type="text"
                name="location"
                id="location"
                value={location}
                onChange={handleLocationChange}
                className="create_input"
                required=""
              />
            </div>
            <div className="inputs">
              <span className="title-text">Date & Time</span>
              <input
                type="datetime-local"
                name="datetime"
                id="datetime"
                value={date}
                onChange={handleDateChange}
                className="create_input"
                required={true}
              />
            </div>
            {planId && (
              <div className="existing-date-inputs">
                <span className="existing-date-title-text">
                  The date & time you've set
                </span>
                <span className="existing-date-text">{formatDate(date)}</span>
              </div>
            )}
            <div className="inputs">
              <span className="title-text">Hyperlinks</span>
              <input
                type="url"
                name="links"
                id="links"
                value={hyperlinks}
                onChange={handleHyperlinksChange}
                className="create_input"
                required=""
              />
            </div>
            {planId ? (
              <button type="submit" className="login_button">
                Update plan
              </button>
            ) : (
              <button type="submit" className="login_button">
                Create plan
              </button>
            )}
          </form>
        </div>
      </div>
      )}
    </main>
  );
};

export default CreatePlanner;

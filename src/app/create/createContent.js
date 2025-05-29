"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import "../create/create.css";

const CreatePlanner = ({ user, currentSession }) => {
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

  // console.log("access_token: " + currentSession.provider_token);

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
        const formattedDate = new Date(data[0]?.planData?.date).toISOString().slice(0, 16);
        setTitle(data[0]?.planData?.title);
        setDescription(data[0]?.planData?.description);
        setLocation(data[0]?.planData?.location);
        setDate(formattedDate);
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

    try {
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + currentSession.provider_token
          },
          body: JSON.stringify(event),
        }
      );
      const data = await response.json();
      console.log("Calendar event created:", data);
      if (data && data.status === "confirmed") {
        return { success: true, data };
      }
      return { success: false, data };
    } catch (error) {
      console.error("Error creating event:", error);
      return { success: false, error };
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
    let isGoogleCalendarEvent = "No";
    let googleCalendarId = "";
    if (user?.app_metadata?.provider == "google") {
      const calendarResult = await createCalendarEvent();
      console.log("Calendar Result:", calendarResult);
      if ( calendarResult.success && calendarResult.data.status === "confirmed") {
        isGoogleCalendarEvent = "Yes";
        googleCalendarId = calendarResult.data.id;
      }
    }
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
              isGoogleCalendarEvent: isGoogleCalendarEvent,
              googleCalendarId: googleCalendarId,
            },
          }),
        }
      );

      if (response.ok) {
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

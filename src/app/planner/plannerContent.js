"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import "../planner/planner.css";
import "boxicons/css/boxicons.min.css";
import noplans from "../assets/empty-plans.json"
import { signout } from "./actions";

const PlannerContent = ({ user }) => {
  const [firstName, setFirstName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.app_metadata?.provider !== "email") {
      const fullName = user?.user_metadata?.name;
      const firstNameSplit = fullName?.split(" ")[0] || "User";
      setFirstName(firstNameSplit);
    } else {
      setFirstName(user?.user_metadata?.display_name || "User");
    }
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans/email/${user?.email}`
        );
        const data = await response.json();
        console.log("DATA:", data);
        setPlans(data);
        console.log("USER:", user)
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchPlans();
    }
  }, [user?.email]);

  useEffect(() => {
    console.log("PLANS:", plans);
  }, [plans]);

  const handleDeletePlan = async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log(`Plan with ID ${id} deleted successfully`);
        const updatedPlans = plans.filter((plan) => plan._id !== id);
        setPlans(updatedPlans);
      } else {
        console.error(`Failed to delete plan with ID ${id}`);
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleUpdate = async (plan) => {
    // Toggle the completed status between "Yes" and "No"
    const newComplete = plan.planData.completed === "No" ? "Yes" : "No";
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/plans/${plan._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          name: user?.user_metadata?.display_name,
          planData: {
            title: plan.planData.title,
            date: plan.planData.date,
            description: plan.planData.description,
            links: plan.planData.links,
            location: plan.planData.location,
            completed: newComplete, // Use the new value here
          },
        }),
      });
      // Update the local state with the new completed status
      if (response.ok) {
        const updatedPlans = plans.map((p) => {
          if (p._id === plan._id) {
            return {
              ...p,
              planData: { ...p.planData, completed: newComplete },
            };
          }
          return p;
        });
        setPlans(updatedPlans);
      } else {
        console.error(`Failed to update plan with ID ${plan._id}`);
      }
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const formattedTime = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? "0" + minute : minute;
    return `It's ${formattedHour}:${formattedMinute} ${period}`;
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
    }, ${date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}`;

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

  const getDateStatus = (dateString) => {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

    if (targetDate < currentDate) {
      // Date is in the past
      return "past";
    } else if (targetDate - currentDate < oneDay) {
      // Date is within one day from now
      return "upcoming";
    } else {
      // Date is in the future
      return "future";
    }
  };

  return (
    <main>
      <a href="/create">
        <button className="floating-button">
          <i className="bx bx-plus"></i>
        </button>
      </a>
      <div className="title-card">
        <h1 className="title-text">
          Hey {firstName}! {formattedTime()}{" "}
        </h1>
        <button className="logout-button" onClick={() => signout()}>
          Log Out
        </button>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!loading && plans.length > 0 && (
        <div className="plan-title">
          <h1>Your future so far.</h1>
        </div>
      )}
      {!loading && plans.length === 0 && (
        <div className="no-plans-title">
          <h1>Seems like you haven't planned anything yet.</h1>
          <h3>Click the + button to solve your predicament.</h3>
          <Lottie
            animationData={noplans}
            className="noPlans-animation"
          />
        </div>
      )}
      {!loading && plans.length > 0 && (
        <div className="plan-container">
          <div className="plan-grid">
            {user?.email &&
              plans.map((plan) => (
                <div className="plan-card">
                  <div key={plan.id} className="plan-data">
                    <h2>
                      {getDateStatus(plan.planData.date) === "upcoming" && (
                        <i className="bx bxs-circle bx-spin upcoming-icon"></i>
                      )}{" "}
                      {plan.planData.title}
                    </h2>
                    {plan.planData.description && <p>{plan.planData.description}</p>}
                    {plan.planData.location && <p>
                      <i className="bx bxs-location-plus"></i>{" "}
                      {plan.planData.location}
                    </p>}
                    {plan.planData.date && <p>
                      <i className="bx bxs-time-five small-icons"></i>
                      {formatDate(plan.planData.date)}
                    </p>}
                    {plan.planData.links && <i className="bx bx-link-alt small-icons"></i>}
                    {plan.planData.links && <a href={plan.planData.links}>{plan.planData.links}</a>}
                  </div>

                  <div className="plan-actions">
                    <div className="checkbox-wrapper-31">
                      <input
                        className="save-cb-state"
                        name={plan._id}
                        type="checkbox"
                        checked={plan.planData.completed === "Yes"}
                        onClick={() => handleUpdate(plan)}
                      />
                      <svg viewBox="0 0 35.6 35.6">
                        <circle
                          className="background"
                          cx="17.8"
                          cy="17.8"
                          r="17.8"
                        ></circle>
                        <circle
                          className="stroke"
                          cx="17.8"
                          cy="17.8"
                          r="14.37"
                        ></circle>
                        <polyline
                          className="check"
                          points="11.78 18.12 15.55 22.23 25.17 12.87"
                        ></polyline>
                      </svg>
                    </div>
                    <a href={`/create?id=${plan._id}`}>
                      <i className="bx bxs-edit edit-icon"></i>
                    </a>
                    <a onClick={() => handleDeletePlan(plan._id)}>
                      <i className="bx bxs-trash trash-icon"></i>
                    </a>
                    {getDateStatus(plan.planData.date) !== "past" && (
                      <a href="#">
                        <i className="bx bx-calendar-event calendar-icon"></i>
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default PlannerContent;

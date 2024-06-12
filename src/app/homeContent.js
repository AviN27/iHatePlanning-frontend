"use client";

import Lottie from "lottie-react";
import plannerHome from "../app/assets/Animation - 1710143093105.json";
import "../app/home.css";
import { redirect } from "next/navigation";
import HomeHandler from "./homeContent";
import { useEffect, useState } from "react";

export default function HomeContent({ user }) {
  const [name, setName] = useState();
  const [loading, setLoading] = useState(true);

  const beforeLoginText = "It's basically a planner."

  useEffect(() => {
    setLoading(true);

    if (user?.app_metadata?.provider !== "email") {
      const fullName = user?.user_metadata?.name;
      const firstNameSplit = fullName?.split(" ")[0] || "User";
      setName(firstNameSplit);
    } else {
      setName(user?.user_metadata?.display_name || "User");
    }

    setLoading(false);
  }, [user]);

  const title = "<Avi_N/>";

  return (
    <body>
      <header>
        <div>ihp.</div>
        <nav>
          <ul>
            <li className="home-header-title">
              crafted by {title}
            </li>
          </ul>
        </nav>
      </header>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!loading && user && (
        <main>
          <section>
            <div className="home-page">
              <div className="home-content-landing-loggedin">
                <div className="home-content-half-1">
                  <h1 className="home-landing-title-1">Welcome to IHatePlanning</h1>
                  <h3 className="home-landing-title-2">{name}!</h3>
                  {/* <a href="https://www.freepik.com/free-vector/dark-red-polygonal-background_1111563.htm#fromView=search&page=1&position=24&uuid=5fe00129-9188-4065-b79e-8b8bc8f6edf7">Image by rocketpixel on Freepik</a> */}
                </div>
                <div className="home-content-half-2">
                  <span>Click to access your planner.</span>
                  <a href="/planner">
                    <button className="signup-planner" role="button">
                      Planner
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {!loading && !user && (
        <main>
          <section>
            <div className="home-page">
              <div className="home-content-landing">
                <div className="home-content-half-1">
                  <h1 className="home-landing-title-1">Welcome to IHatePlanning!</h1>
                  <h3 className="home-landing-title-2">{beforeLoginText}</h3>
                </div>
                <div className="home-content-half-2">
                  <p>Click to gain control of your future.</p>
                  <a href="/login?isSignup=true">
                    <button className="signup" role="button">
                      Sign Up
                    </button>
                  </a>
                  <p>Click if you already gained some control.</p>
                  <a href="/login?isSignup=false">
                    <button className="signup" role="button">
                      Log In
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </body>
  );
}

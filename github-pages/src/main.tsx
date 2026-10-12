import React from "react";
import { createRoot } from "react-dom/client";
import "../../app/globals.css";
import Home from "../../app/page";
import Courses from "../../app/courses/page";
import Unit2 from "../../app/unit2/page";

const repoBase = "/115social";
const pathname = window.location.pathname.replace(repoBase, "").replace(/\/$/, "") || "/";
const Page = pathname.startsWith("/unit2")
  ? Unit2
  : pathname.startsWith("/unit1")
    ? Home
    : Courses;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);

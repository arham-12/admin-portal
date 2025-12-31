import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth";
import toast from "react-hot-toast";
import axios from "axios";

const AddCourse = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { authToken } = useContext(AuthContext);

  const [inputs, setInputs] = useState({
    course_name: "",
    course_code: "",
  });

  const [degreeDropdown, setDegreeDropdown] = useState(false);
  const [degreePrograms, setDegreePrograms] = useState([]);
  const [selectedDegreeProgramId, setSelectedDegreeProgramId] = useState(null);
  const [selectedDegreeProgramName, setSelectedDegreeProgramName] = useState("");

  const [teacherDropdown, setTeacherDropdown] = useState(false);
  const [relevantTeachers, setRelevantTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [semesterDropdown, setSemesterDropdown] = useState(false);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const [selectedSemester, setSelectedSemester] = useState(null);

  /* =========================
     FETCH DEGREE PROGRAMS
  ==========================*/
  useEffect(() => {
    const getPrograms = async () => {
      console.log("📡 Fetching degree programs...");
      try {
        const res = await axios.get(
          `${apiUrl}/api/degree-programs/`,
          {
            headers: { Authorization: `Token ${authToken}` },
          }
        );

        console.log("✅ Degree programs response:", res.data);
        setDegreePrograms(res.data.degree_programs || []);
      } catch (err) {
        console.error("❌ Error fetching programs:", err);
        toast.error("Failed to load degree programs");
      }
    };

    getPrograms();
  }, [authToken, apiUrl]);

  /* =========================
     INPUT HANDLER
  ==========================*/
  const handleInputChange = (e) => {
    console.log(`✏️ Input changed: ${e.target.name}`, e.target.value);
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  /* =========================
     FETCH TEACHERS BY PROGRAM NAME
  ==========================*/
  const getRelevantTeachers = async (programName) => {
    console.log("🎯 Selected Degree Program Name:", programName);

    setRelevantTeachers([]);
    setSelectedTeacher("");

    try {
      console.log("📡 Fetching teachers for program:", programName);

      const res = await axios.get(
        `${apiUrl}/api/filter-teachers/${encodeURIComponent(programName)}/`,
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );

      console.log("✅ Teacher API response:", res.data);

      setRelevantTeachers(res.data.teacher_names || []);
    } catch (err) {
      console.error("❌ Error fetching teachers:", err.response || err);
      toast.error("Failed to load teachers");
    }
  };

  /* =========================
     ADD COURSE
  ==========================*/
  const addCourse = async (e) => {
    e.preventDefault();

    console.log("📝 Add Course clicked");
    console.log("📦 Current form state:", {
      inputs,
      selectedDegreeProgramId,
      selectedDegreeProgramName,
      selectedTeacher,
      selectedSemester,
    });

    if (
      !inputs.course_name ||
      !inputs.course_code ||
      !selectedDegreeProgramId ||
      !selectedTeacher ||
      !selectedSemester
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const payload = {
        course_name: inputs.course_name,
        course_code: inputs.course_code,
        degree_program: selectedDegreeProgramName, // ID still used here
        teacher: selectedTeacher,
        semester: selectedSemester,
      };

      console.log("🚀 Sending payload to backend:", payload);

      const res = await axios.post(
        `${apiUrl}/api/courses/`,
        payload,
        {
          headers: { Authorization: `Token ${authToken}` },
        }
      );

      console.log("✅ Course creation response:", res);

      if (res.status === 201) {
        toast.success("Course added successfully!");
      }
    } catch (err) {
      console.error("❌ Error adding course:", err.response || err);
      toast.error(
        err?.response?.data?.course_code?.[0] || "Error adding course"
      );
    }
  };

  return (
    <form className="font-[sans-serif] h-screen mt-16 max-w-2xl mx-auto">

      <div className="py-2 text-center">
        <h1 className="text-4xl font-medium">Add New Course</h1>
        <p className="text-sm">Create a new course</p>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-4">

        <input
          type="text"
          name="course_name"
          value={inputs.course_name}
          onChange={handleInputChange}
          placeholder="Course Name"
          className="px-4 py-3 border border-black rounded"
        />

        <input
          type="text"
          name="course_code"
          value={inputs.course_code}
          onChange={handleInputChange}
          placeholder="Course Code"
          className="px-4 py-3 border border-black rounded"
        />

        {/* DEGREE PROGRAM */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDegreeDropdown(!degreeDropdown)}
            className="w-full px-5 py-2.5 border border-black flex justify-between"
          >
            {selectedDegreeProgramName || "Select Program"}
          </button>

          {degreeDropdown && (
            <ul className="absolute bg-white shadow-lg w-full z-50">
              {degreePrograms.map((item) => (
                <li
                  key={item.id}
                  onClick={() => {
                    console.log("🎓 Program selected:", item);
                    setSelectedDegreeProgramId(item.id);
                    setSelectedDegreeProgramName(item.program_name);
                    setDegreeDropdown(false);
                    getRelevantTeachers(item.program_name);
                  }}
                  className="px-5 py-2 cursor-pointer hover:bg-blue-50"
                >
                  {item.program_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TEACHER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setTeacherDropdown(!teacherDropdown)}
            className="w-full px-5 py-2.5 border border-black flex justify-between"
          >
            {selectedTeacher || "Select Teacher"}
          </button>

          {teacherDropdown && (
            <ul className="absolute bg-white shadow-lg w-full z-50">
              {relevantTeachers.length > 0 ? (
                relevantTeachers.map((t, i) => (
                  <li
                    key={i}
                    onClick={() => {
                      console.log("👨‍🏫 Teacher selected:", t);
                      setSelectedTeacher(t);
                      setTeacherDropdown(false);
                    }}
                    className="px-5 py-2 cursor-pointer hover:bg-blue-50"
                  >
                    {t}
                  </li>
                ))
              ) : (
                <li className="px-5 py-2 text-gray-500">
                  No teacher found
                </li>
              )}
            </ul>
          )}
        </div>

        {/* SEMESTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSemesterDropdown(!semesterDropdown)}
            className="w-full px-5 py-2.5 border border-black flex justify-between"
          >
            {selectedSemester || "Select Semester"}
          </button>

          {semesterDropdown && (
            <ul className="absolute bg-white shadow-lg w-full z-50">
              {semesters.map((s) => (
                <li
                  key={s}
                  onClick={() => {
                    console.log("📘 Semester selected:", s);
                    setSelectedSemester(s);
                    setSemesterDropdown(false);
                  }}
                  className="px-5 py-2 cursor-pointer hover:bg-blue-50"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={addCourse}
        className="mt-5 w-full bg-primary text-white py-2 rounded"
      >
        Add Course
      </button>

    </form>
  );
};

export default AddCourse;

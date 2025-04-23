// import Home from "./pages/home/Home";
// import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
// // import Users from "./pages/users/Users";
// import FaceExpression from "./pages/facialexpression/FaceExpression";
// import FaceAge from "./pages/faceage/FaceAge";
// import FaceGender from "./pages/facegender/FaceGender";
// import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";
// import Menu from "./components/menu/Menu";
// import Identification from "./pages/Identification/Identification";
// import "./styles/global.scss";
// import { useState, useEffect } from "react";
// // import User from "./pages/user/User";
// // import Product from "./pages/facialexpression/FaceExpression";
// import {
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";
// import FacePosition from "./pages/faceposition/FacePosition";
// import BodyPosition from "./pages/bodyposition/BodyPosition";


// const queryClient = new QueryClient();

// function App() {

//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch("http://127.0.0.1:8000/api/data") // Adjust API endpoint
//       .then((response) => response.json())
//       .then((data) => setData(data))
//       .catch((error) => console.error("Error fetching data:", error));
//   }, []);

//   const Layout = () => {
//     return (
//       <div className="main">
//         <Navbar />
//         <div className="container">
//           <div className="menuContainer">
//             <Menu />
//           </div>
//           <div className="contentContainer">
//             <QueryClientProvider client={queryClient}>
//               <Outlet />
//             </QueryClientProvider>
//           </div>
//         </div>
//         <Footer />
//       </div>
//     );
//   };

//   const router = createBrowserRouter([
//     {
//       path: "/",
//       element: <Layout />,
//       children: [
//         {
//           path: "/verification",
//           element: <Home />,
//         },
//         {
//           path: "/identification",
//           element: <Identification />,
//         },
//         {
//           path: "/facial-expression",
//           element: <FaceExpression />,
//         },
//         {
//           path: "/face-age",
//           element: <FaceAge />,
//         },
//         {
//           path: "/face-gender",
//           element: <FaceGender />,
//         },
//         {
//           path: "/face-position",
//           element: <FacePosition />,
//         },
//         {
//           path: "/body-position",
//           element: <BodyPosition />,
//         },
//       ],
//     },
//   ]);

//   return <RouterProvider router={router} />;
// }

// export default App;



import Verification from "./pages/verification/Verification";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import FaceExpression from "./pages/facialexpression/FaceExpression";
// import FaceAge from "./pages/faceage/FaceAge";
// import FaceGender from "./pages/facegender/FaceGender";
import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";
import Menu from "./components/menu/Menu";
import Identification from "./pages/Identification/Identification";
import "./styles/global.scss";
// import { useState, useEffect } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
// import FacePosition from "./pages/faceposition/FacePosition";
// import BodyPosition from "./pages/bodyposition/BodyPosition";
import OtherEstimations from "./pages/OtherEstimations/OtherEstimations";

const queryClient = new QueryClient();

function App() {

  // Remove the unused 'data' state and fetch logic
  // const [data, setData] = useState(null);

  // useEffect(() => {
  //   fetch("http://127.0.0.1:8000/api/data")
  //     .then((response) => response.json())
  //     .then((data) => setData(data))
  //     .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  const Layout = () => {
    return (
      <div className="main">
        <Navbar />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className="contentContainer">
            <QueryClientProvider client={queryClient}>
              <Outlet />
            </QueryClientProvider>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/verification",
          element: <Verification />,
        },
        {
          path: "/identification",
          element: <Identification />,
        },
        {
          path: "/facial-expression",
          element: <FaceExpression />,
        },
        {
          path: "other-estimations",
          element: <OtherEstimations/>,
        },
        // {
        //   path: "/face-age",
        //   element: <FaceAge />,
        // },
        // {
        //   path: "/face-gender",
        //   element: <FaceGender />,
        // },
        // {
        //   path: "/face-position",
        //   element: <FacePosition />,
        // },
        // {
        //   path: "/body-position",
        //   element: <BodyPosition />,
        // },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;

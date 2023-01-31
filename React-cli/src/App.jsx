
import React,{Suspense,lazy}from "raect"
import {Link,Routes,Route} from "react-router-dom"
// import Home from "./pages/Home/index"
// import About from "./pages/About/index"
const Home=lazy(()=>import("./pages/Home"));
const About=lazy(()=>import("./pages/About"))

function App(){
    return (
        <div>
            <h1>App</h1>
            <ul>
                <li>
                    <Link to="/home">Home</Link>
                </li>
                <li>
                    <Link to="/about">About</Link>
                </li>
            </ul>
            <Suspense fallback={<div>loading...</div>}>
                <Routes>
                    <Route path="/home" element={<Home/>}/>
                    <Route path="/about" element={<About/>} />
                </Routes>
            </Suspense>
        </div>
        
    )
    
}

export default App
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <>
      <Router>
        <Routes>{/* <Route path="/" element={<Home />} /> */}</Routes>
        <div className="min-h-screen bg-gradient-to-br from-darker via-dark to-primary">
          <div className="min-h-screen flex items-center justify-center p-4">
            <p className=" text-green-100 font-bold">Hello everyone!!!</p>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;

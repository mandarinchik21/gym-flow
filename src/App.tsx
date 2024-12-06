import './App.css'
import { BrowserRouter as Router } from 'react-router-dom';
import Routes from "./routes/Routes.tsx";
import {Header} from "./components/Header.tsx";

;

function App() {


  return (
        <Router>
            <Header/>
            <div className="pages-container">
                <Routes />
            </div>
        </Router>
  )
}

export default App;

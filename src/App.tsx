import './App.css';
import { Sidebar } from "./compoments/Sidebar/Sidebar";
import { Content } from './compoments/Content/Content';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datepicker/dist/react-datepicker.css";
import ContextMessage from "./Context/ContextMessage";
import ContextProductCheck from './Context/ContextProductCheck';

function App() {
    return (
        <ContextMessage>
            <ContextProductCheck>
                <div className="App">
                    <Sidebar />
                    <Content />
                </div>
            </ContextProductCheck>
        </ContextMessage>
    );
}

export default App;

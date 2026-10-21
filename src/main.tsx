import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { PaperCharacterFilter } from './components/PaperCharacterFilter';
import './styles.css';
import './game-hud.css';
import './plaza-experiences.css';
import './town-life.css';
import './day-night.css';
import './world-ui.css';
import './editorial.css';

createRoot(document.getElementById('root')!).render(<StrictMode><PaperCharacterFilter/><App /></StrictMode>);

// router.tsx
import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import GameSelection from "../components/GameSelection";
import LeagueSelection from "../games/lol/LeagueSelection";
import LOLGame from "../games/lol/index";
import CSGame from "../games/cs/index";

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        path: "/",
        element: <GameSelection />, // Page d'accueil avec sélection de jeu
      },
      {
        path: "/lol",
        element: <LeagueSelection />,
      },
      {
        path: "/lol/play/:leagueId",
        element: <LOLGame />,
      },
      {
        path: "/cs",
        element: <CSGame />,
      },
      // Autres routes
    ],
  },
]);

export default router;

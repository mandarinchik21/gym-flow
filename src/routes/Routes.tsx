import {Navigate, Route, Routes} from 'react-router-dom';
import { SignUp } from "../pages/SignUp.tsx";
import {Main} from "../pages/Main.tsx";
import {SignIn} from "../pages/SignIn.tsx";
import {Membership} from "../pages/Membership.tsx";
import CookieManager from "../utils/cookieManager.ts";
import {useEffect} from "react";
import {customEvent} from "../utils/customEvent.ts";
import { SchedulePage} from "../pages/Schedule.tsx";
import {Trainers} from "../pages/Trainers.tsx";
import {Clients} from "../pages/Clients.tsx";
import {useUserStore} from "../stores/useUserStore.tsx";

const RoutesComponent = () => {
    const {isLoggedIn, isAdmin, setIsLoggedIn, setIsAdmin} = useUserStore();
    const isLoggedInCookie = CookieManager.getItem('isLoggedIn');
    const isAdminCookie = CookieManager.getItem('isAdmin');


    useEffect(() => {

        setIsLoggedIn(!!isLoggedInCookie);
        setIsAdmin(!!isAdminCookie);
        customEvent.on('changeCookie',()=> {
            setTimeout(()=> {
                const isLoggedIn = CookieManager.getItem('isLoggedIn');
                const isAdmin = CookieManager.getItem('isAdmin');

                setIsLoggedIn(!!isLoggedIn);
                setIsAdmin(!!isAdmin)
            }, 0);
        })
    }, []);

  return (
    <Routes>
      <Route path="/" element={<Main/>} />
      <Route path="/signUp" element={<SignUp/>} />
      <Route path="/signIn" element={<SignIn/>} />
        {
            (isLoggedIn || isLoggedInCookie) && (
                <>
                    <Route path={'/membership'} element={<Membership/>}/>
                    <Route path={'/schedule'} element={<SchedulePage/>}/>
                    <Route path={'/trainers'} element={<Trainers/>}/>
                    {
                        (isAdminCookie || isAdmin) && (
                            <>
                                <Route path={'/clients'} element={<Clients/>}/>
                            </>
                        )
                    }
                </>
            )
        }
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default RoutesComponent;

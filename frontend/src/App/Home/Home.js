import React, { useContext} from 'react';
import {ProfileContext} from '../../context/Context';
// import {toast} from 'react-toastify'
const Home = () => {
    const {profileState:{perfil}} = useContext(ProfileContext)

    // useEffect(() => {
    //     toast.success("Teste")
    // })

    return (
        <>
            <div>Olá {perfil !== '' ? perfil.first_name : ""}</div>
        </>

    );
  };
  
  export default Home;
  
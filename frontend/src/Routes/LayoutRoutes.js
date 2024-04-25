import React, { useEffect, useContext, useState } from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from '../App/Home/Home';
import Default from '../Layouts/Default';
import AuthSimpleLayout from "../Layouts/AuthSimpleLayout";
import PasswordResetFom from '../components/authentication/PasswordResetForm';
import { ProfileContext } from '../context/Context';
//Analytics
import IndexRegimes from '../App/Analytics/Regimes/Index';
import ViewRegime from '../App/Analytics/Regimes/View';
//Register
import IndexCadGerais from '../App/Register/Index';
import IndexMachinery from '../App/Register/Machinery/Index';
import IndexBenfeitorias from '../App/Register/Benfeitorias/Index';
import ViewBenfeitoria from '../App/Register/Benfeitorias/View';
import BenfeitoriaEdit from '../App/Register/Benfeitorias/Edit';
import IndexAnaliseSolo from '../App/Register/Analises/SoloIndex';
import ViewAnaliseSolo from '../App/Register/Analises/SoloView';
//Pipeline
import IndexPessoal from '../App/Pipefy/Pessoal/Index';
import ViewPessoal from '../App/Pipefy/Pessoal/View';
//Ambiental
import View from "../App/Ambiental/InemaOutorgas/View";
import Edit from "../App/Ambiental/InemaOutorgas/Edit";
import MapaPontos from "../App/Ambiental/Mapa";
import NotFound from "../Layouts/NotFound";
import IndexAPPO from '../App/Ambiental/InemaAppo/Index';
import IndexOutorgas from '../App/Ambiental/InemaOutorgas/Index';
import { View as ViewAppo } from "../App/Ambiental/InemaAppo/View";
import { Edit as EditAppo } from "../App/Ambiental/InemaAppo/Edit";
//Admin
import IndexUsers from '../App/Admin/Users/Index';
//Services
import Cotacoes from '../App/Services/Cotacoes';
import Commodities from '../App/Services/Currency/Commodities';

const LayoutRoutes = () => {
  const token = localStorage.getItem("token")
  const navigate = useNavigate();
  const [inicializado, setInicializado] = useState(false)
  const { profileDispatch } = useContext(ProfileContext)

  useEffect(() => {
    const CallAPI = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await response.json();
        if (response.status === 401) {
          navigate("/auth/login");
        } else if (response.status === 200) {
          profileDispatch({
            type: 'SET_PROFILE',
            payload: {
              first_name: data.first_name,
              avatar: data.avatar
            }
          });
        }
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    if (!inicializado) {
      CallAPI();
      setInicializado(true);
    }
  }, [inicializado, profileDispatch, navigate, token]);
  return (
    <Routes>
      <Route element={<Default />}>
        <Route path="/analytics">
          <Route path="regime" element={<IndexRegimes />}/>
          <Route path="regime/:id" element={<ViewRegime />}/>
        </Route>
        <Route path="/home" element={<Home />} />
        <Route path="/register">
          <Route path="" element={<IndexCadGerais />}/>
          <Route path='machinery' element={<IndexMachinery />}/>
          <Route path='farm-assets' element={<IndexBenfeitorias />}/>
          <Route path='farm-assets/:uuid' element={<ViewBenfeitoria />}/>
          <Route path='farm-assets/edit/:uuid' element={<BenfeitoriaEdit />}/>
          <Route path='analysis/soil' element={<IndexAnaliseSolo />}/>
          <Route path='analysis/soil/:uuid' element={<ViewAnaliseSolo />}/>
        </Route>
        <Route path="/pipefy">
          <Route path="pessoal" element={<IndexPessoal />}/>
          <Route path="pessoal/:uuid" element={<ViewPessoal />}/>
        </Route>
        <Route path="/ambiental/inema">
          <Route path="outorgas" element={<IndexOutorgas />}/>
          <Route path="outorgas/:uuid" element={<View />} />
          <Route path="outorgas/edit/:uuid" element={<Edit />} />
          <Route path="outorga/map" element={<MapaPontos key='outorga' type='outorga' />} />
          <Route path="appos" element={<IndexAPPO/>}/>
          <Route path="appos/:uuid" element={<ViewAppo />} />
          <Route path="appos/edit/:uuid" element={<EditAppo />} />
          <Route path="appo/map" element={<MapaPontos key='appo' type='appo' />} />
        </Route>
        <Route path="/services">
          <Route path="currency" element={<Cotacoes />}/>
          <Route path="currency/commodity" element={<Commodities/>}/>
        </Route>
        <Route path="/admin">
          <Route path="users" element={<IndexUsers />}/>
        </Route>
      </Route>
      <Route element={<AuthSimpleLayout />}>
        <Route path="/auth/password/change" element={<PasswordResetFom />} />
      </Route>
      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
};

export default LayoutRoutes;
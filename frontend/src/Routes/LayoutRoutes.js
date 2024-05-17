import React, { useEffect, useContext, useState } from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from '../App/Home/Home';
import Default from '../Layouts/Default';
import AuthSimpleLayout from "../Layouts/AuthSimpleLayout";
import PasswordResetFom from '../components/authentication/PasswordResetForm';
import { ProfileContext } from '../context/Context';
//Alongamentos
import IndexAlongamentos from '../App/Alongamentos/Index';
//Analytics
import IndexRegimes from '../App/Analytics/Regimes/Index';
import ViewRegime from '../App/Analytics/Regimes/View';
import IndexFarms from '../App/Analytics/Farms/Index';
import ViewFarm from '../App/Analytics/Farms/View';
import IndexCredit from '../App/Analytics/Credit/Index';
import ViewCredit from '../App/Analytics/Credit/View';
//Dashboard
import DashCredit from '../App/Dashboard/Credit/Index';
import DashGestaoCredito from '../App/Dashboard/Credit/GestaoCredito';
import DashProspects from '../App/Dashboard/Pipefy/Prospects';
import DashProdutos from '../App/Dashboard/Pipefy/Produtos';
import DashAmbiental from '../App/Dashboard/Ambiental/Index';
//External
import IndexOutorgasANA from '../App/External/OutorgasANA/Index';
//Irrigation
import IndexIrrigacao from '../App/Irrigacao/Index';
import IndexPivots from '../App/Irrigacao/Pivots/Index';
import ViewPivot from '../App/Irrigacao/Pivots/View';
import MapaPivots from '../App/Irrigacao/Pivots/Mapa';
//Register
import IndexCadGerais from '../App/Register/Index';
import IndexMachinery from '../App/Register/Machinery/Index';
import IndexBenfeitorias from '../App/Register/Benfeitorias/Index';
import ViewBenfeitoria from '../App/Register/Benfeitorias/View';
import BenfeitoriaEdit from '../App/Register/Benfeitorias/Edit';
import IndexAnaliseSolo from '../App/Register/Analises/SoloIndex';
import ViewAnaliseSolo from '../App/Register/Analises/SoloView';
//Pipefy
import IndexPessoal from '../App/Pipefy/Pessoal/Index';
import ViewPessoal from '../App/Pipefy/Pessoal/View';
import IndexProspects from '../App/Pipefy/Prospects/Index';
import ViewProspect from '../App/Pipefy/Prospects/View';
import IndexProdutos from '../App/Pipefy/Produtos/Index';
import ViewCardProduto from '../App/Pipefy/Produtos/View';
//Processes
import IndexFollowup from '../App/Processes/Followup/Index';
import ViewFollowup from '../App/Processes/Followup/View';
//Ambiental
import View from "../App/Ambiental/InemaOutorgas/View";
import Edit from "../App/Ambiental/InemaOutorgas/Edit";
import MapaPontos from "../App/Ambiental/Mapa";
import NotFound from "../Layouts/NotFound";
import IndexAPPO from '../App/Ambiental/InemaAppo/Index';
import IndexOutorgas from '../App/Ambiental/InemaOutorgas/Index';
import { View as ViewAppo } from "../App/Ambiental/InemaAppo/View";
import { Edit as EditAppo } from "../App/Ambiental/InemaAppo/Edit";
import IndexASV from '../App/Ambiental/InemaASV/Index';
import ViewASV from '../App/Ambiental/InemaASV/View';
import EditASV from '../App/Ambiental/InemaASV/Edit';
import MapaAreasASV from '../App/Ambiental/InemaASV/Mapa';
import IndexRequerimentos from '../App/Ambiental/Requerimentos/Index';
import MapaPontosRequerimento from '../App/Ambiental/Requerimentos/Mapa';
import NewRequerimento from '../App/Ambiental/Requerimentos/New';
import ViewRequerimentoAPPO from '../App/Ambiental/Requerimentos/View';
//Licenses
import IndexLicenses from '../App/Licenses/Index';
import ViewLicenca from '../App/Licenses/View';
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
        <Route path="/alongamentos">
          <Route path="" element={<IndexAlongamentos />}/>
        </Route>
        <Route path="/analytics">
          <Route path="regime" element={<IndexRegimes />}/>
          <Route path="regime/:id" element={<ViewRegime />}/>
          <Route path="farms" element={<IndexFarms />}/>
          <Route path="farms/:id" element={<ViewFarm />}/>
          <Route path="credit" element={<IndexCredit />}/>
          <Route path="credit/:id" element={<ViewCredit />}/>
        </Route>
        <Route path="/api">
          <Route path="ana">
            <Route path="outorgas" element={<IndexOutorgasANA />}/>
          </Route>
        </Route>
        <Route path="/dashboard">
          <Route path="ambiental" element={<DashAmbiental />}/>
          <Route path="credit" element={<DashCredit />}/>
          <Route path="credit/progress" element={<DashGestaoCredito />}/>
          <Route path="prospects" element={<DashProspects />}/>
          <Route path="products" element={<DashProdutos />}/>
        </Route>
        <Route path="/home" element={<Home />} />
        <Route path="/irrigation">
          <Route path="" element={<IndexIrrigacao />}/>
          <Route path="pivots" element={<IndexPivots />}/>
          <Route path="pivots/:uuid" element={<ViewPivot />}/>
          <Route path="pivots/map" element={<MapaPivots />}/>
        </Route>
        <Route path="/licenses">
          <Route path="" element={<IndexLicenses />}/>
          <Route path=":uuid" element={<ViewLicenca />}/>
        </Route>
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
          <Route path="pipes/301573049" element={<IndexProspects />}/>
          <Route path="pipes/301573049/cards/:id" element={<ViewProspect />}/>
          <Route path="pipes/301573538" element={<IndexProdutos />}/>
          <Route path="pipes/301573538/cards/:id" element={<ViewCardProduto />}/>
        </Route>
        <Route path="/processes">
          <Route path="followup" element={<IndexFollowup />}/>
          <Route path="followup/:id" element={<ViewFollowup />}/>
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
          <Route path="asv" element={<IndexASV/>}/>
          <Route path="asv/:uuid" element={<ViewASV/>}/>
          <Route path="asv/edit/:uuid" element={<EditASV />} />
          <Route path="asv/map" element={<MapaAreasASV />} />
          <Route path="requerimentos" element={<IndexRequerimentos />} />
          <Route path="requerimentos/appo" element={<MapaPontosRequerimento key='appo' type='appo' />} />
          <Route path="requerimentos/new" element={<NewRequerimento key='appo' type='appo' />} />
          <Route path="requerimentos/appo/:uuid" element={<ViewRequerimentoAPPO />} />
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
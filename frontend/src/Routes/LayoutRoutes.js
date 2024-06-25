import React, { useEffect, useContext, useState } from 'react';
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from '../App/Home/Home';
import Default from '../Layouts/Default';
import AuthSimpleLayout from "../Layouts/AuthSimpleLayout";
import PasswordResetFom from '../components/authentication/PasswordResetForm';
import { ProfileContext } from '../context/Context';
//Admin
import IndexUsers from '../App/Admin/Users/Index';
import IndexAdministrator from '../App/Admin/Index';
import TestsIndex from '../App/Admin/Tests/Tests';
import { ResultDatabase, ResultPipe } from '../App/Admin/Tests/Results';
//Alongamentos
import IndexAlongamentos from '../App/Alongamentos/Index';
//Assessments
import Quiz from '../App/Assessments/Quiz';
import MyAssessments from '../App/Assessments/My';
import IndexAssessments from '../App/Assessments/Index';
import ResultsAssessment from '../App/Assessments/Results';
//Credit
import IndexCredit from '../App/Credit/Index';
//Dashboard
import DashCredit from '../App/Dashboard/Credit/Index';
import DashGestaoCredito from '../App/Dashboard/Credit/GestaoCredito';
import DashProspects from '../App/Dashboard/Pipefy/Prospects';
import DashProdutos from '../App/Dashboard/Pipefy/Produtos';
import DashAmbiental from '../App/Dashboard/Ambiental/Index';
import DashBillings from '../App/Dashboard/Finances/Payments';
import DashRevenues from '../App/Dashboard/Finances/Revenues';
//External
import IndexOutorgasANA from '../App/External/OutorgasANA/Index';
import Exchange from '../App/Services/Currency/Exchange';
//Farms
import IndexAppFarms from '../App/Farms/Index';
import IndexFarms from '../App/Farms/Farms/Index';
import IndexRegimes from '../App/Farms/Regimes/Index';
import ViewRegime from '../App/Farms/Regimes/View';
import ViewFarm from '../App/Farms/Farms/View';
import MapaCAR from '../App/Farms/Farms/Mapa';
//Finances
import DREConsolidado from '../App/Finances/DREActual';
import DREProvisionado from '../App/Finances/DREForecast';
import IndexAutomPagamentos from '../App/Finances/AutomPagamentos/Index';
import SaldosContasIndex from '../App/Finances/FluxoCaixa/IndexSaldos';
import IndexTransfers from '../App/Finances/Transfers/Index';
import IndexMovimentacoes from '../App/Finances/FluxoCaixa/IndexMoviments';
import IndexReembolsos from '../App/Finances/FluxoCaixa/IndexRefunds';
import ReportPagamentos from '../App/Finances/Reports/Pagamentos';
import ReportCobrancas from '../App/Finances/Reports/Cobrancas';
//Glebas
import IndexGlebas from '../App/Glebas/Index';
import MapaGlebas from '../App/Glebas/Mapa';
import ViewGleba from '../App/Glebas/View';
//Inbox
import Notifications from '../App/Inbox/Index';
//Irrigation
import IndexIrrigacao from '../App/Irrigacao/Index';
import IndexPivots from '../App/Irrigacao/Pivots/Index';
import ViewPivot from '../App/Irrigacao/Pivots/View';
import MapaPivots from '../App/Irrigacao/Pivots/Mapa';
//KPI
import IndexMyIndicators from '../App/Kpi/Index';
import IndexIndicators from '../App/Kpi/IndexGeral';
import ViewIndicator from '../App/Kpi/View';
//Pipeline
import Products from '../App/Pipeline/products/products';
//Pipefy
import IndexProspects from '../App/Pipefy/Prospects/Index';
import ViewProspect from '../App/Pipefy/Prospects/View';
import IndexProdutos from '../App/Pipefy/Produtos/Index';
import ViewCardProduto from '../App/Pipefy/Produtos/View';
import IndexContratos from '../App/Pipefy/Contratos/Index';
import ViewContrato from '../App/Pipefy/Contratos/View';
//Register
import IndexPessoal from '../App/Register/Pessoal/Index';
import ViewPessoal from '../App/Register/Pessoal/View';
import IndexCadGerais from '../App/Register/Index';
import IndexMachinery from '../App/Register/Machinery/Index';
import IndexBenfeitorias from '../App/Register/Benfeitorias/Index';
import ViewBenfeitoria from '../App/Register/Benfeitorias/View';
import BenfeitoriaEdit from '../App/Register/Benfeitorias/Edit';
import IndexAnaliseSolo from '../App/Register/Analises/SoloIndex';
import ViewAnaliseSolo from '../App/Register/Analises/SoloView';
import NewFeedback from '../App/Register/Feedbacks/New';
import IndexFeedbacks from '../App/Register/Feedbacks/Index';
import IndexCartorios from '../App/Register/Cartorios/Index';
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
//Services
import ExternalAPIs from '../App/Services/API';
import Commodities from '../App/Services/Currency/Commodities';
import ConsultaCNPJ from '../App/Services/CNPJ';
import ToolsIndex from '../App/Services/Tools/Index';
import KMLToCoordinate from '../App/Services/Tools/KMLToCoordinate';
import PivotCoordinates from '../App/Services/Tools/PivotCoordinates';
import InsertPoints from '../App/Services/Tools/InsertPoints';
import KMLPolygon from '../App/Services/Tools/KMLPolygon';
import ServicesMaps from '../App/Services/Maps';
import WebSocketComponent from '../App/Pipeline/Websocket';
import ViewCredit from '../App/Credit/View';

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
        <Route path="/websocket" element={<WebSocketComponent />}></Route>
        <Route path="/administrator">
          <Route path="" element={<IndexAdministrator />}/>
          <Route path="tests" element={<TestsIndex />}/>
          <Route path="tests/pipe/:id" element={<ResultPipe />}/>
          <Route path="tests/database/:id" element={<ResultDatabase />}/>
        </Route>
        <Route path="/admin">
          <Route path="users" element={<IndexUsers />}/>
        </Route>
        <Route path="/alongamentos">
          <Route path="" element={<IndexAlongamentos />}/>
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
        <Route path="/assessments">
          <Route path="quiz/:uuid" element={<Quiz />}/>
          <Route path="my" element={<MyAssessments />}/>
          <Route path="" element={<IndexAssessments />}/>
          <Route path="results/:uuid" element={<ResultsAssessment />}/>
        </Route>
        <Route path="/credit">
          <Route path="" element={<IndexCredit />}/>
          <Route path=":uuid" element={<ViewCredit />}/>
        </Route>
        <Route path="/dashboard">
          <Route path="ambiental" element={<DashAmbiental />}/>
          <Route path="credit" element={<DashCredit />}/>
          <Route path="credit/progress" element={<DashGestaoCredito />}/>
          <Route path="prospects" element={<DashProspects />}/>
          <Route path="products" element={<DashProdutos />}/>
          <Route path="finances/billings" element={<DashBillings />}/>
          <Route path="finances/revenues" element={<DashRevenues />}/>
        </Route>
        <Route path="/external-api">
          <Route path="ana">
            <Route path="outorgas" element={<IndexOutorgasANA />}/>
          </Route>
          <Route path="" element={<ExternalAPIs />}/>
          <Route path="cnpj" element={<ConsultaCNPJ />}/>
          <Route path="currency/commodity" element={<Commodities />}/>
          <Route path="currency/exchange" element={<Exchange />}/>
        </Route>
        <Route path="/farms">
          <Route path="" element={<IndexAppFarms />}/>
          <Route path="regime" element={<IndexRegimes />}/>
          <Route path="regime/:uuid" element={<ViewRegime />}/>
          <Route path="farms" element={<IndexFarms />}/>
          <Route path="farms/map" element={<MapaCAR />}/>
          <Route path="farms/:uuid" element={<ViewFarm />}/>
        </Route>
        <Route path="/finances">
          <Route path="dre/actual" element={<DREConsolidado />}/>
          <Route path="dre/forecast" element={<DREProvisionado />}/>
          <Route path="automation/payments" element={<IndexAutomPagamentos />}/>
          <Route path="accounts" element={<SaldosContasIndex />}/>
          <Route path="transfers" element={<IndexTransfers />}/>
          <Route path="financial" element={<IndexMovimentacoes />}/>
          <Route path="refunds" element={<IndexReembolsos />}/>
          <Route path="billings" element={<ReportPagamentos />}/>
          <Route path="revenues" element={<ReportCobrancas />}/>
        </Route>
        <Route path="/glebas">
          <Route path="" element={<IndexGlebas />}/>
          <Route path=":id" element={<ViewGleba />}/>
          <Route path="map" element={<MapaGlebas />}/>
        </Route>
        <Route path="/home" element={<Home />} />
        <Route path="/irrigation">
          <Route path="" element={<IndexIrrigacao />}/>
          <Route path="pivots" element={<IndexPivots />}/>
          <Route path="pivots/:uuid" element={<ViewPivot />}/>
          <Route path="pivots/map" element={<MapaPivots />}/>
        </Route>
        <Route path="/kpi">
          <Route path="myindicators" element={<IndexMyIndicators />}/>
          <Route path="indicators" element={<IndexIndicators />}/>
          <Route path="indicators/:uuid" element={<ViewIndicator />}/>
        </Route>
        <Route path="/licenses">
          <Route path="" element={<IndexLicenses />}/>
          <Route path=":uuid" element={<ViewLicenca />}/>
        </Route>
        <Route path="/litec">
          <Route path="glebas" element={<IndexGlebas />}/>
        </Route>
        <Route path="/Notifications">
          <Route path="" element={<Notifications />}/>
        </Route>
        <Route path="/pipefy">
          <Route path="pipes/301573049" element={<IndexProspects />}/>
          <Route path="pipes/301573049/cards/:id" element={<ViewProspect />}/>
          <Route path="pipes/301573538" element={<IndexProdutos />}/>
          <Route path="pipes/301573538/cards/:id" element={<ViewCardProduto />}/>
          <Route path="contracts" element={<IndexContratos />}/>
          <Route path="contracts/:id" element={<ViewContrato />}/>
        </Route>
        <Route path="/pipeline">
          <Route path=":pipe" element={<Products />}/>
          <Route path=":pipe/:code" element={<Products />}/>
        </Route>
        <Route path="/processes">
          <Route path="followup" element={<IndexFollowup />}/>
          <Route path="followup/:id" element={<ViewFollowup />}/>
        </Route>
        <Route path="/register">
          <Route path="" element={<IndexCadGerais />}/>
          <Route path="cartorios" element={<IndexCartorios />}/>
          <Route path="pessoal" element={<IndexPessoal />}/>
          <Route path="pessoal/:uuid" element={<ViewPessoal />}/>
          <Route path='machinery' element={<IndexMachinery />}/>
          <Route path='farm-assets' element={<IndexBenfeitorias />}/>
          <Route path='farm-assets/:uuid' element={<ViewBenfeitoria />}/>
          <Route path='farm-assets/edit/:uuid' element={<BenfeitoriaEdit />}/>
          <Route path='analysis/soil' element={<IndexAnaliseSolo />}/>
          <Route path='analysis/soil/:uuid' element={<ViewAnaliseSolo />}/>
          <Route path='feedback/new' element={<NewFeedback />}/>
          <Route path='feedbacks' element={<IndexFeedbacks />}/>
        </Route>
        <Route path="/services">
          <Route path="maps" element={<ServicesMaps />}/>
          <Route path="tools" element={<ToolsIndex />}/>
          <Route path="tools/kml-to-coordinates" element={<KMLToCoordinate />}/>
          <Route path="tools/pivot" element={<PivotCoordinates />}/>
          <Route path="tools/LatLong" element={<InsertPoints />}/>
          <Route path="tools/kml/polygon" element={<KMLPolygon />}/>
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
import { Link} from "react-router-dom";
import Flex from '../components/common/Flex';
import LoginForm from '../components/authentication/LoginForm';

const Login = () => {
  return (
    <>
      <Flex justifyContent="between" alignItems="center" className="mb-2">
        <h5>Log in</h5>
        <p className="fs--1 text-600 mb-0">
          ou <Link to="/auth/register" className="text-primary fw-semibold">Crie Uma Conta</Link>
        </p>
      </Flex>
      <LoginForm />
    </>
  );
};

export default Login;

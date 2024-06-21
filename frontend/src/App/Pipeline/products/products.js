import { Link, useParams } from "react-router-dom";
import KanbanProvider from "../KanbanProvider";
import KanbanContainer from "./KanbanContainer";
import { Col, Row } from "react-bootstrap";
import { PipeContext } from "../../../context/Context";
import { useContext } from "react";

function Products() {
  const {pipe} = useParams()
  return (
    <KanbanProvider code={pipe}>
      <KanbanContainer/>
    </KanbanProvider>
  );
  }
  export default Products;
  
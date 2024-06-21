import { Link } from "react-router-dom";
import KanbanProvider from "../KanbanProvider";
import KanbanContainer from "./KanbanContainer";
import { Col, Row } from "react-bootstrap";
import { PipeContext } from "../../../context/Context";
import { useContext } from "react";

function Products() {
  return (
    <KanbanProvider id={1}>
      <KanbanContainer/>
    </KanbanProvider>
  );
  }
  export default Products;
  
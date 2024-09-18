import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const CustomBreadcrumb = ({children, iskanban}) => {
    return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} 
        className={`fs--1 mb-${iskanban ? '0':'2'} w-50 pt-${iskanban ? '2':'0'}`} 
    aria-label="breadcrumb">
        {children}
    </Breadcrumbs>
    )
}
export default CustomBreadcrumb;

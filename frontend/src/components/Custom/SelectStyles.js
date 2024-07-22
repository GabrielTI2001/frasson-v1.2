const customStyles = {
    control: (base, state) => ({
      ...base,
      // height: 28,
      minHeight: 20,
      border: state.isFocused ? '1px solid #b9c3cf' : '1px solid #d8e2ef',
      boxShadow: state.isFocused ? 0 : 0,
      '&:hover': {
         border: state.isFocused ? '1px solid #b9c3cf' : '1px solid #d8e2ef'
      },
    }),
    valueContainer: base => ({
      ...base,
      paddingTop: 0,
      paddingBlock: 0,
      lineHeight: 1.4,
      fontSize: 13
    }),
    multiValue: base => ({
      ...base,
      height: 22
    }),
    option: base =>({
      ...base,
      fontSize: '0.8rem'
    }),
    indicatorsContainer:  base => ({
      ...base,
      top: -6,
      height: 28,
      minHeight: 20,
    }),
  };

export const customStylesDark = {
  control: (base, state) => ({
    ...base,
    // height: 28,
    minHeight: 20,
    border: state.isFocused ? '1px solid #3d4658' : '1px solid #3d4658',
    boxShadow: state.isFocused ? 0 : 0,
    '&:hover': {
       border: state.isFocused ? '1px solid #3d4658' : '1px solid #3d4658'
    },
    backgroundColor: '#0b1727'
  }),
  valueContainer: base => ({
    ...base,
    paddingTop: 0,
    paddingBlock: 0,
    lineHeight: 1.4,
    fontSize: 13
  }),
  multiValue: base => ({
    ...base,
    height: 22,
    backgroundColor: '#3d4658',
    color: '#ddd'
  }),
  multiValueLabel: base => ({
    ...base,
    color: '#ddd'
  }),
  menu: base => ({
    ...base,
    backgroundColor: '#3d4658 !important',
    color: '#ddd'
  }),
  option: base => ({
    ...base,
    backgroundColor: '#3d4657 !important',
    color: '#ddd', 
    fontSize: '0.8rem',
    '&:hover': {
      backgroundColor: '#56627a !important'
   },
  }),
  indicatorsContainer:  base => ({
    ...base,
    top: -6,
    height: 28,
    minHeight: 20,
  }),
};

export default customStyles

export const customStyle = (theme, isInvalid) => {
  const baseStyles = theme === 'light' ? customStyles : customStylesDark;
  return {
    ...baseStyles,
    control: (provided, state) => ({
      ...baseStyles.control(provided, state),
      borderColor: isInvalid ? 'red !important' : state.isFocused ? '#86b7fe' : provided.borderColor
    }),
    // Adicione outros estilos conforme necessário
  };
};
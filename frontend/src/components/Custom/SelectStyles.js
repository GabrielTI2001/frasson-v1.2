const customStyles = {
    control: (base, state) => ({
      ...base,
      height: 28,
      minHeight: 20,
      border: state.isFocused ? '1px solid #b9c3cf' : '1px solid #d8e2ef',
      boxShadow: state.isFocused ? 0 : 0,
      '&:hover': {
         border: state.isFocused ? '1px solid #b9c3cf' : '1px solid #d8e2ef'
      },
    }),
    valueContainer: base => ({
      ...base,
      top: -2,
      paddingTop: 0,
      height: 28,
      paddingBlock: 0,
      lineHeight: 1.4
    }),
    multiValue: base => ({
      ...base,
      height: 22
    }),
    indicatorsContainer:  base => ({
      ...base,
      top: -6,
      height: 28,
      minHeight: 20,
    }),
  };

export const customStylesDark = {
    control: base => ({
      ...base,
      height: 28,
      minHeight: 20,
      borderColor: '#344050',
      backgroundColor: '#0b1727',
      '&:focus': {
        borderColor: '#202731'
      }
    }),
    valueContainer: base => ({
      ...base,
      top: -2,
      paddingTop: 0,
      height: 20,
      paddingBlock: 0,
      lineHeight: 23
    }),
    indicatorsContainer:  base => ({
      ...base,
      top: -6,
      height: 28,
      minHeight: 20
    }),
    singleValue: base => ({
      ...base,
      color: '#d8e2ef'
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#0b1727',
      color: '#d8e2ef'
    }),
    option: base => ({
      ...base,
      backgroundColor: '#0b1727',
      color: '#d8e2ef',
      '&:hover': {
        backgroundColor: '#202731',
      }
    }),
  };


export default customStyles
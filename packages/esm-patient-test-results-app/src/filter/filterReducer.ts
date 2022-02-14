const reducer = (state, action) => {
  switch (action.type) {
    case 'initialize':
      return action.payload;
    case 'update':
      return {
        ...state,
        ...action.payload,
      };
    case 'toggleVal':
      return {
        ...state,
        [action.name]: !state[action.name],
      };
    default:
      return state;
  }
};

export default reducer;

import { createStyles, Theme } from "@material-ui/core/styles";

const styles = ({ spacing }: Theme) =>
  createStyles({
    fab: {
      position: "fixed",
      bottom: 20,
      width: "100%",
      textAlign: "center",
    },
    button: {
      margin: 2,
    },
    extendedIcon: {
      marginRight: 2,
    },
  });

export default styles;

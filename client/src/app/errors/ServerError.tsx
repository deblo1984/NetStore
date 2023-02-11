import { Button, Container, Divider, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function ServerError() {
  const { state } = useLocation();
  return (
    <Container component={Paper}>
      {state?.error ? (
        <>
          <Typography gutterBottom variant="h3" color="secondary">
            {state.error.title}
          </Typography>
          <Divider />
          <Typography variant="body1">
            {state.error.detail || "Internal Server Error"}
          </Typography>
        </>
      ) : (
        <Typography gutterBottom variant="h3" color="secondary">
          Server error
        </Typography>
      )}
      <Typography variant="h6" gutterBottom>
        Server Error
      </Typography>
      <Button component={Link} to="/catalog">
        Go back to store
      </Button>
    </Container>
  );
}

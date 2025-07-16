import { Title, Subtitle } from "../components";

const Thanks = () => {
  return (
    <div className="flex flex-column flex-align-center">
      <Title text="Kész," />
      <Subtitle text="sikeresen leadtad a szavazatod" />
    </div>
  );
}
 
export default Thanks;
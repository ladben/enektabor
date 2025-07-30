import { useProfileDisplay } from "../../../../context/ProfileDisplayContext";

const ProfileDisplayFlip = () => {
  const { flip } = useProfileDisplay();

  return (
    <div
      className="avatar elevation-sm w-100 h-100 pos-rel"
      onClick={flip}
    >
      <img className="w-100 h-100" src="./profile_display_flip_icon.svg" />
    </div>
  );
}
 
export default ProfileDisplayFlip;
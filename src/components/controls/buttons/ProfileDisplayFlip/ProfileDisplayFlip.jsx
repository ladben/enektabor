import { useProfileDisplay } from "../../../../context/ProfileDisplayContext";

const ProfileDisplayFlip = () => {
  const { profileDisplay, flip } = useProfileDisplay();

  return (
    <div
      className="w-100 h-100 bg-acc border-md border-bg b-radius-40-perc p-12 elevation-sm"
      onClick={flip}
    >
      {profileDisplay.icon && <img className="w-100 h-100" src="./flip_to_text.svg" />}
      {!profileDisplay.icon && <img className="w-100 h-100" src="./flip_to_icon.svg" />}
    </div>
  );
}
 
export default ProfileDisplayFlip;
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { usePeople } from "../../hooks/usePeople";
import { Avatar, Button, GridFlow, Title } from "../../components";

const SelectUserStep = ({ competition }) => {
  const { data: users = [] } = usePeople(competition.id);
  const [selectedId, setSelectedId] = useState(null);
  const { loginAsUser } = useUser();

  const handleContinue = () => {
    const selected = users.find((u) => u.user_id === selectedId);
    loginAsUser({
      user_id: selected.user_id,
      name: selected.people.name,
      avatar: selected.people.avatar,
      roles: [{
        competition_id: competition.id,
        is_voter: selected.is_voter,
        is_jury: selected.is_jury,
        is_performer: selected.is_performer,
      }],
      competition_id: competition.id,
    });
  };

  return (
    <>
      <Title text="Ki vagy?" />
      <GridFlow>
        {users.map((u) => (
          <div
            key={u.user_id}
            onClick={() => setSelectedId(u.user_id)}
            style={{maxWidth: 'calc((100% - 30px) / 4)'}}
            className="w-100 ar-square"
          >
            <Avatar
              imgSrc={u.people.avatar}
              imgName={u.people.name}
              state={!selectedId ? 'default' : selectedId === u.user_id ? 'selected' : 'faded'}
            />
          </div>
        ))}
      </GridFlow>
      {selectedId && (
        <Button
          onClick={handleContinue}
          className="pos-abs b-0"
          iconType="tick"
          text="Folytatás"
          animation="slide-from-bottom"
        />
      )}
    </>
  );
};
 
export default SelectUserStep;
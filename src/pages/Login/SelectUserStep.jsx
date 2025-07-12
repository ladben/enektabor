import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../context/UserContext";
import { Avatar, Button, GridFlow, Title } from "../../components";

const SelectUserStep = ({ competition }) => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const { loginAsUser } = useUser();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('competition_participants')
        .select('user_id, is_voter, is_jury, is_performer, people(name, avatar)')
        .eq('competition_id', competition.id);
      setUsers(data);
    };
    fetch();
  }, [competition.id]);

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
          >
            <Avatar
              imgSrc={u.people.avatar ? `data:image/png;base64,${u.people.avatar}` : null}
              imgName={u.people.name}
              state={!selectedId ? 'default' : selectedId === u.user_id ?'selected' : 'faded'}
            />
          </div>
        ))}
      </GridFlow>
      {selectedId && <Button onClick={handleContinue} className="pos-abs b-0" iconType="tick" text="Folytatás" animation="slide-from-bottom"/>}
    </>
  );
};
 
export default SelectUserStep;
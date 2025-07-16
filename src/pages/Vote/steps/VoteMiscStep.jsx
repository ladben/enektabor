import { useEffect, useState } from "react";
import { Title, Subtitle, Avatar, Button, GridFlow } from "../../../components";

const VoteMiscStep = ({ category, performances, selected, onSelect, onConfirm, onBack }) => {
  const [currentSelection, setCurrentSelection] = useState(selected);

  useEffect(() => {
    setCurrentSelection(selected);
  }, [selected]);

  const handleClick = (id) => {
    setCurrentSelection(id);
    onSelect(id);
  };

  return (
    <>
      <div className="flex flex-column flex-align-center">
        <Title text="Szavazz!" />
        <Subtitle text={category.question} />
      </div>
      <GridFlow noPadding>
        {performances.map((p) => (
          <div
            key={p.id}
            onClick={() => handleClick(p.id)}
            style={{maxWidth: 'calc((100% - 30px) / 4)'}}
            className="w-100 ar-square"
          >
            <Avatar
              imgSrc={p.people.avatar}
              imgName={p.people.name}
              state={
                !currentSelection
                  ? 'default'
                  : currentSelection === p.id
                  ? 'selected'
                  : 'faded'
              }
            />
          </div>
        ))}
      </GridFlow>

      <div className="flex flex-align-center gap-10">
        <Button text="Vissza" onClick={onBack} />
        <Button text="Tovább" onClick={onConfirm} disabled={!currentSelection}/>
      </div>
    </>
  );
}
 
export default VoteMiscStep;
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button, Avatar, Title, Subtitle, Box } from "../../../components";

const RankPerformersStep = ({ performers, performances, onBack, onConfirm }) => {
  const [ranked, setRanked] = useState(performers);

  useEffect(() => {
    const selected = performances.filter((p) => performers.includes(p.id));
    setRanked(selected)
  }, [performers, performances]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(ranked);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);
    setRanked(items);
  };

  return (
    <>
      <div className="flex flex-column flex-align-center">
        <Title text="Sorrendezz!" />
        <Subtitle text="Tartsd lenyomva és húzd a sorrendezéshez" />
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rankedPerformers">
          {(droppableProvided) => (
            <div
              className="rank-list flex flex-column gap-10 ofy-auto p-16"
              {...droppableProvided.droppableProps}
              ref={droppableProvided.innerRef}
            >
              {ranked.map((p, index) => (
                <Draggable key={p.id} draggableId={String(p.id)} index={index}>
                  {(draggableProvided, snapshot) => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      className={`rank-box flex flex-align-center flex-fill gap-10 p-8 ${snapshot.isDragging ? "dragging" : ""}`}
                      style={{
                        ...draggableProvided.draggableProps.style,
                        top: snapshot.isDragging
                          ? `${draggableProvided.draggableProps.style.top - 100}px`
                          : draggableProvided.draggableProps.style.top,
                        left: snapshot.isDragging
                          ? '50px'
                          : draggableProvided.draggableProps.style.left,
                      }}
                    >
                      <Box
                        className="ranked-performance"
                        state="selected"
                        artist={p.songs.artist}
                        title={p.songs.title}
                        avatar={{imgSrc: p.people.avatar, imgName: p.people.name}}
                        badgeText={index + 1}
                        smallImg={true}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex flex-align-center gap-10">
        <Button text="Vissza" onClick={onBack} />
        <Button text="Tovább" onClick={() => onConfirm(ranked)} />
      </div>
    </>
  );
}
 
export default RankPerformersStep;
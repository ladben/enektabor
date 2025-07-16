const GridFlow = ({ children, noPadding }) => {
  return (
    <div className={`w-100 flex gap-10 flex-wrap flex-justify-center px-8 ofy-auto ${noPadding ? 'pb-8' : 'pb-112'}`}>{children}</div>
  );
}
 
export default GridFlow;
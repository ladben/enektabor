import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Title, Button, Spinner } from '../../components';
import bcrypt from 'bcryptjs';

const AdminDashboard = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingComp, setEditingComp] = useState(null); // Ha null, listát mutatunk. Ha objektum, szerkesztünk.

  // Szerkesztési részletes állapotok
  const [compName, setCompName] = useState('');
  const [compPassword, setCompPassword] = useState('');
  const [topNumber, setTopNumber] = useState(3);
  const [allMiscCategories, setAllMiscCategories] = useState([]);
  const [compCategories, setCompCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatQuestion, setNewCatQuestion] = useState('');

  // Résztvevők állapotai
  const [allPeople, setAllPeople] = useState([]);
  const [compParticipants, setCompParticipants] = useState([]); // [{user_id, is_voter, is_jury, is_performer}]
  const [newPersonName, setNewPersonName] = useState('');

  // 🌟 Dalok kezeléséhez szükséges új állapotok
  const [allSongs, setAllSongs] = useState([]); // Globális dalok listája a DB-ből
  const [performerSongs, setPerformerSongs] = useState({}); // { [user_id]: song_id } - Melyik énekes melyik dalt énekli ezen a versenyen
  const [newSongArtist, setNewSongArtist] = useState('');
  const [newSongTitle, setNewSongTitle] = useState('');
  const [activeSongAddingUserId, setActiveSongAddingUserId] = useState(null); // Melyik felhasználónál van épp nyitva az "Új dal" panel

  useEffect(() => {
    fetchCompetitions();
    fetchGlobalData();
  }, []);

  const fetchCompetitions = async () => {
    setLoading(true);
    const { data: comps, error } = await supabase
      .from('competitions')
      .select(`*, competition_participants(count)`)
      .order('created_at', { ascending: false });

    if (!error) setCompetitions(comps || []);
    setLoading(false);
  };

  const fetchGlobalData = async () => {
    const { data: cats } = await supabase.from('misc_categories').select('*');
    const { data: people } = await supabase.from('people').select('*');
    const { data: songs } = await supabase
      .from('songs')
      .select('*')
      .order('artist', { ascending: true });

    setAllMiscCategories(cats || []);
    setAllPeople(people || []);
    setAllSongs(songs || []);
  };

  // --- Verseny státusz kapcsolók (is_active, voting_started) ---
  const handleToggleActive = async (id, currentStatus) => {
    if (currentStatus) return;

    setLoading(true);
    await supabase
      .from('competitions')
      .update({ is_active: false })
      .neq('id', id);
    await supabase
      .from('competitions')
      .update({ is_active: true })
      .eq('id', id);

    await fetchCompetitions();
  };

  const handleToggleVoting = async (id, currentStatus) => {
    await supabase
      .from('competitions')
      .update({ voting_started: !currentStatus })
      .eq('id', id);
    await fetchCompetitions();
  };

  // --- Szerkesztés / Új megnyitása ---
  const handleOpenEdit = async (comp) => {
    setPerformerSongs({});
    setActiveSongAddingUserId(null);

    if (comp) {
      // SZERKESZTÉS MÓD
      setEditingComp(comp);
      setCompName(comp.name);
      setCompPassword('');
      setTopNumber(comp.top_number);

      const { data: cCats } = await supabase
        .from('competition_has_misc_category')
        .select('misc_category_id')
        .eq('competition_id', comp.id);
      setCompCategories(cCats?.map((c) => c.misc_category_id) || []);

      const { data: cParts } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', comp.id);
      setCompParticipants(cParts || []);

      // 🌟 Lekérjük az énekesek meglévő előadásait/dalait ehhez a versenyhez
      const { data: perfs } = await supabase
        .from('performances')
        .select('performer_id, song_id')
        .eq('competition_id', comp.id);

      const songMapping = {};
      perfs?.forEach((p) => {
        songMapping[p.performer_id] = p.song_id;
      });
      setPerformerSongs(songMapping);
    } else {
      // ÚJ VERSENY MÓD
      setEditingComp({ id: 'new' });
      setCompName('');
      setCompPassword('');
      setTopNumber(4);
      setCompCategories([]);
      setCompParticipants([]);

      // BULK IMPORT: Legutóbbi aktív verseny résztvevőinek betöltése automatikusan
      const lastActive = competitions.find((c) => c.is_active);
      if (lastActive) {
        const { data: lastParts } = await supabase
          .from('competition_participants')
          .select('user_id, is_voter, is_jury, is_performer')
          .eq('competition_id', lastActive.id);

        if (lastParts) setCompParticipants(lastParts);

        // 🌟 Bulk import esetén áthozzuk a dalokat is, hátha ugyanazt éneklik (de szabadon módosítható)
        const { data: lastPerfs } = await supabase
          .from('performances')
          .select('performer_id, song_id')
          .eq('competition_id', lastActive.id);

        const songMapping = {};
        lastPerfs?.forEach((p) => {
          songMapping[p.performer_id] = p.song_id;
        });
        setPerformerSongs(songMapping);
      }
    }
  };

  // --- Kategória Kezelés ---
  const toggleCategoryInComp = (catId) => {
    setCompCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  const handleCreateAndAddCategory = async () => {
    if (!newCatName || !newCatQuestion) return;
    const { data, error } = await supabase
      .from('misc_categories')
      .insert({ name: newCatName, question: newCatQuestion })
      .select()
      .single();

    if (!error && data) {
      setAllMiscCategories((prev) => [...prev, data]);
      setCompCategories((prev) => [...prev, data.id]);
      setNewCatName('');
      setNewCatQuestion('');
    }
  };

  // --- Felhasználó Kezelés ---
  const toggleParticipantRole = (userId, roleKey) => {
    setCompParticipants((prev) => {
      const exists = prev.find((p) => p.user_id === userId);
      if (exists) {
        return prev.map((p) =>
          p.user_id === userId ? { ...p, [roleKey]: !p[roleKey] } : p,
        );
      } else {
        return [
          ...prev,
          {
            user_id: userId,
            is_voter: false,
            is_jury: false,
            is_performer: false,
            [roleKey]: true,
          },
        ];
      }
    });
  };

  const removeParticipant = (userId) => {
    setCompParticipants((prev) => prev.filter((p) => p.user_id !== userId));
    setPerformerSongs((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
  };

  const handleCreateAndAddPerson = async () => {
    if (!newPersonName) return;
    const { data, error } = await supabase
      .from('people')
      .insert({ name: newPersonName, avatar: null })
      .select()
      .single();

    if (!error && data) {
      setAllPeople((prev) => [...prev, data]);
      setCompParticipants((prev) => [
        ...prev,
        {
          user_id: data.id,
          is_voter: true,
          is_jury: false,
          is_performer: false,
        },
      ]);
      setNewPersonName('');
    }
  };

  // --- 🌟 Dal választás és Új dal beszúrása ---
  const handleSelectSongForPerformer = (userId, songId) => {
    setPerformerSongs((prev) => ({
      ...prev,
      [userId]: songId ? parseInt(songId, 10) : null,
    }));
  };

  const handleCreateAndAddSong = async (userId) => {
    if (!newSongArtist || !newSongTitle) return;

    const { data, error } = await supabase
      .from('songs')
      .insert({ artist: newSongArtist, title: newSongTitle })
      .select()
      .single();

    if (!error && data) {
      setAllSongs((prev) =>
        [...prev, data].sort((a, b) => a.artist.localeCompare(b.artist, 'hu')),
      );
      // Azonnal hozzárendeljük az énekeshez az újonnan kreált dalt
      setPerformerSongs((prev) => ({
        ...prev,
        [userId]: data.id,
      }));
      setNewSongArtist('');
      setNewSongTitle('');
      setActiveSongAddingUserId(null); // Ablak bezárása
    }
  };

  // --- Mentési logika (Update & Insert) ---
  const handleSaveCompetition = async () => {
    setLoading(true);
    let compId = editingComp.id;

    const payload = {
      name: compName,
      top_number: topNumber,
    };

    if (compPassword) {
      payload.password = await bcrypt.hash(compPassword, 10);
    }

    if (compId === 'new') {
      const { data, error } = await supabase
        .from('competitions')
        .insert(payload)
        .select()
        .single();
      if (error) return setLoading(false);
      compId = data.id;
    } else {
      await supabase.from('competitions').update(payload).eq('id', compId);
    }

    // --- Kategória kapcsolatok szinkronizálása ---
    await supabase
      .from('competition_has_misc_category')
      .delete()
      .eq('competition_id', compId);
    if (compCategories.length > 0) {
      const catInserts = compCategories.map((catId) => ({
        competition_id: compId,
        misc_category_id: catId,
      }));
      await supabase.from('competition_has_misc_category').insert(catInserts);
    }

    // --- Résztvevők szinkronizálása ---
    await supabase
      .from('competition_participants')
      .delete()
      .eq('competition_id', compId);
    if (compParticipants.length > 0) {
      const partInserts = compParticipants.map((p) => ({
        competition_id: compId,
        user_id: p.user_id,
        is_voter: p.is_voter,
        is_jury: p.is_jury,
        is_performer: p.is_performer,
      }));
      await supabase.from('competition_participants').insert(partInserts);
    }

    // --- 🌟 Performances (Előadások / Dalok) szinkronizálása ---
    await supabase.from('performances').delete().eq('competition_id', compId);

    const performanceInserts = [];
    compParticipants.forEach((p) => {
      // Csak akkor mentünk előadást, ha az illető Performer ÉS választott dalt
      if (p.is_performer && performerSongs[p.user_id]) {
        performanceInserts.push({
          competition_id: compId,
          performer_id: p.user_id,
          song_id: performerSongs[p.user_id],
          selected: false, // Alapértelmezetten hamis, amíg bent a wait-roomban ki nem választja magának
        });
      }
    });

    if (performanceInserts.length > 0) {
      await supabase.from('performances').insert(performanceInserts);
    }

    setEditingComp(null);
    fetchCompetitions();
  };

  // KATEGÓRIÁK CSOPORTOSÍTOTT ÉS MAGYAR ÁBÉCÉ SZERINTI ÉLŐ RENDEZÉSE
  const sortedCategories = useMemo(() => {
    return [...allMiscCategories].sort((a, b) => {
      const inCompA = compCategories.includes(a.id) ? 1 : 0;
      const inCompB = compCategories.includes(b.id) ? 1 : 0;
      if (inCompB !== inCompA) return inCompB - inCompA;
      return a.name.localeCompare(b.name, 'hu');
    });
  }, [allMiscCategories, compCategories]);

  // JOGOSULTSÁG ÉS MAGYAR ÁBÉCÉ SZERINTI CSOPORTOSÍTOTT RENDEZÉS (FELHASZNÁLÓK)
  const sortedPeople = useMemo(() => {
    return [...allPeople].sort((a, b) => {
      const inCompA = compParticipants.some((p) => p.user_id === a.id) ? 1 : 0;
      const inCompB = compParticipants.some((p) => p.user_id === b.id) ? 1 : 0;
      if (inCompB !== inCompA) return inCompB - inCompA;
      return a.name.localeCompare(b.name, 'hu');
    });
  }, [allPeople, compParticipants]);

  if (loading) return <Spinner />;

  // ==========================================
  // RENDER: LISTA NÉZET
  // ==========================================
  if (!editingComp) {
    return (
      <div
        className='w-100 ofy-auto p-32 text-color-white'
        style={{ maxWidth: '1200px', textAlign: 'left' }}
      >
        <div className='flex flex-justify-space-between flex-align-center mb-24'>
          <Title text='Adminisztrációs Panel' />
          <button
            className='px-16 py-8 bg-acc text-color-bg b-radius-10 font-bold border-none'
            style={{ cursor: 'pointer' }}
            onClick={() => handleOpenEdit(null)}
          >
            ➕ Új hozzáadása
          </button>
        </div>

        <table
          className='w-100 border-sm border-text b-radius-10'
          style={{ borderCollapse: 'collapse', overflow: 'hidden' }}
        >
          <thead>
            <tr className='bg-text text-color-bg font-bold'>
              <th className='p-12 text-left'>Verseny neve</th>
              <th className='p-12'>Résztvevők száma</th>
              <th className='p-12'>Aktív (Csak egy lehet)</th>
              <th className='p-12'>Szavazás elindítva</th>
              <th className='p-12'>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {competitions.map((comp) => (
              <tr
                key={comp.id}
                className='border-sm border-grey bg-bg text-center'
              >
                <td className='p-12 text-left font-bold text-color-text'>
                  {comp.name}
                </td>
                <td className='p-12'>
                  {comp.competition_participants?.[0]?.count || 0} fő
                </td>
                <td className='p-12'>
                  <input
                    type='checkbox'
                    checked={comp.is_active}
                    onChange={() => handleToggleActive(comp.id, comp.is_active)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: 'var(--color-text)',
                      cursor: 'pointer',
                    }}
                  />
                </td>
                <td className='p-12'>
                  <input
                    type='checkbox'
                    checked={comp.voting_started}
                    onChange={() =>
                      handleToggleVoting(comp.id, comp.voting_started)
                    }
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: 'var(--color-accent)',
                      cursor: 'pointer',
                    }}
                  />
                </td>
                <td className='p-12'>
                  <button
                    className='px-12 py-4 border-sm border-text text-color-text b-radius-5 bg-transparent font-bold'
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenEdit(comp)}
                  >
                    Módosítás
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ==========================================
  // RENDER: SZERKESZTŐ / ÚJ VERSENY NÉZET
  // ==========================================
  return (
    <div
      className='w-100 ofy-auto p-32 text-color-white'
      style={{ maxWidth: '1200px', textAlign: 'left' }}
    >
      <div
        className='flex flex-justify-space-between flex-align-center mb-32 border-sm border-transparent pb-16'
        style={{ borderBottomColor: 'var(--color-text)' }}
      >
        <Title
          text={
            editingComp.id === 'new'
              ? 'Új verseny létrehozása'
              : `Szerkesztés: ${compName}`
          }
        />
        <div className='flex gap-16'>
          <button
            className='px-16 py-8 border-sm border-grey text-color-grey b-radius-10 bg-transparent font-bold'
            style={{ cursor: 'pointer' }}
            onClick={() => setEditingComp(null)}
          >
            Mégse
          </button>
          <button
            className='px-16 py-8 bg-text text-color-bg b-radius-10 font-bold border-none'
            style={{ cursor: 'pointer' }}
            onClick={handleSaveCompetition}
          >
            Mentés
          </button>
        </div>
      </div>

      <div className='flex flex-row gap-32 flex-wrap'>
        {/* BAL OSZLOP: Alapadatok és Kategóriák */}
        <div
          className='flex-fill flex flex-column gap-24'
          style={{ minWidth: '400px' }}
        >
          <div className='p-20 border-sm border-grey b-radius-20 bg-bg'>
            <h2 className='mb-16 text-color-text'>Alapadatok</h2>
            <div className='flex flex-column gap-10'>
              <label className='text-sm text-color-grey'>
                Verseny megnevezése
              </label>
              <input
                type='text'
                className='p-12 b-radius-10 bg-grey text-color-bg border-none text-h2 font-bold'
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
              />

              <label className='text-sm text-color-grey mt-10'>
                Új jelszó (Hagyd üresen, ha nem változik)
              </label>
              <input
                type='password'
                className='p-12 b-radius-10 bg-grey text-color-bg border-none text-h2'
                value={compPassword}
                onChange={(e) => setCompPassword(e.target.value)}
              />

              <label className='text-sm text-color-grey mt-10'>
                Toplista létszám (0 = nincs toplista, csak kategóriák)
              </label>
              <input
                type='number'
                className='p-12 b-radius-10 bg-grey text-color-bg border-none text-h2 font-bold'
                value={topNumber}
                onChange={(e) =>
                  setTopNumber(parseInt(e.target.value, 10) || 0)
                }
              />
            </div>
          </div>

          {/* Kategóriák kezelése */}
          <div className='p-20 border-sm border-grey b-radius-20 bg-bg'>
            <h2 className='mb-16 text-color-text'>
              Vegyes különdíj kategóriák
            </h2>
            <div
              className='flex flex-column gap-10 max-h-300 ofy-auto mb-16 p-4 border-sm border-transparent b-radius-10'
              style={{ borderBottomColor: 'var(--color-grey)' }}
            >
              {sortedCategories.map((cat) => (
                <label
                  key={cat.id}
                  className='flex flex-row gap-10 flex-align-center p-8 b-radius-5 transition-all hover-bg'
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type='checkbox'
                    checked={compCategories.includes(cat.id)}
                    onChange={() => toggleCategoryInComp(cat.id)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <div className='font-bold text-color-white text-left'>
                      {cat.name}
                    </div>
                    <div className='text-sm text-color-grey'>
                      {cat.question}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Új Kategória DB-be adása azonnal */}
            <div className='p-12 border-sm border-text b-radius-10 flex flex-column gap-10'>
              <div className='text-sm font-bold text-color-acc'>
                Új kategória hozzáadása a rendszerhez:
              </div>
              <input
                type='text'
                placeholder='Kategória neve (pl. Legjobb hang)'
                className='p-8 b-radius-5 bg-grey text-color-bg border-none'
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <input
                type='text'
                placeholder='Szavazási kérdés (pl. Kinek volt a legjobb hangja?)'
                className='p-8 b-radius-5 bg-grey text-color-bg border-none'
                value={newCatQuestion}
                onChange={(e) => setNewCatQuestion(e.target.value)}
              />
              <button
                className='py-8 bg-acc text-color-white font-bold b-radius-5 border-none'
                style={{ cursor: 'pointer' }}
                onClick={handleCreateAndAddCategory}
              >
                Mentés és Hozzáadás a versenyhez
              </button>
            </div>
          </div>
        </div>

        {/* JOBB OSZLOP: Felhasználók, szerepkörök és dalválasztások */}
        <div
          className='flex-fill p-20 border-sm border-grey b-radius-20 bg-bg'
          style={{ minWidth: '550px' }}
        >
          <h2 className='mb-16 text-color-text'>Résztvevők és Jogosultságok</h2>

          {/* Új ember felvétele a DB-be */}
          <div className='flex gap-10 mb-16'>
            <input
              type='text'
              placeholder='Új résztvevő teljes neve...'
              className='p-12 b-radius-10 bg-grey text-color-bg border-none flex-fill text-lg font-bold'
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
            />
            <button
              className='px-16 bg-acc text-color-white font-bold b-radius-10 border-none'
              style={{ cursor: 'pointer' }}
              onClick={handleCreateAndAddPerson}
            >
              + Felvesz
            </button>
          </div>

          <div
            className='flex flex-column gap-10 ofy-auto pr-4'
            style={{ maxHeight: '650px' }}
          >
            {sortedPeople.map((person) => {
              const part = compParticipants.find(
                (p) => p.user_id === person.id,
              );
              const inComp = !!part;
              const isPerformerActive = inComp && part.is_performer;

              return (
                <div
                  key={person.id}
                  className={`flex flex-column p-12 b-radius-10 border-sm transition-all gap-10 ${inComp ? 'border-text bg-transparent' : 'border-grey opacity-50'}`}
                >
                  {/* Felső információs sor */}
                  <div className='flex flex-row flex-justify-space-between flex-align-center w-100'>
                    <div className='text-left'>
                      <div className='font-bold text-lg text-color-white'>
                        {person.name}
                      </div>
                      <div className='text-sm text-color-grey'>
                        {inComp
                          ? 'Szelektálva a versenyre'
                          : 'Nincs a versenyben'}
                      </div>
                    </div>

                    <div className='flex flex-row gap-8 flex-align-center'>
                      {inComp ? (
                        <>
                          <button
                            className={`px-8 py-4 text-sm b-radius-5 font-bold border-none ${part.is_voter ? 'bg-text text-color-bg' : 'bg-grey text-color-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              toggleParticipantRole(person.id, 'is_voter')
                            }
                          >
                            Voter
                          </button>
                          <button
                            className={`px-8 py-4 text-sm b-radius-5 font-bold border-none ${part.is_jury ? 'bg-text text-color-bg' : 'bg-grey text-color-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              toggleParticipantRole(person.id, 'is_jury')
                            }
                          >
                            Jury
                          </button>
                          <button
                            className={`px-8 py-4 text-sm b-radius-5 font-bold border-none ${part.is_performer ? 'bg-text text-color-bg' : 'bg-grey text-color-bg'}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              toggleParticipantRole(person.id, 'is_performer')
                            }
                          >
                            Performer
                          </button>
                          <button
                            className='px-8 py-4 text-sm bg-acc text-color-white b-radius-5 border-none font-bold ml-6'
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeParticipant(person.id)}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          className='px-12 py-6 border-sm border-text text-color-text b-radius-5 bg-transparent font-bold'
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            toggleParticipantRole(person.id, 'is_voter')
                          }
                        >
                          ➕ Beválogat
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 🌟 ALSÓ SZEKCIÓ: Dal választó (Csak ha az illető be van válogatva ÉS Performer!) */}
                  {isPerformerActive && (
                    <div className='p-10 b-radius-5 bg-bg border-sm border-grey flex flex-column gap-6 mt-4'>
                      <div className='flex flex-row flex-justify-space-between flex-align-center gap-10'>
                        <label className='text-sm text-color-text font-bold'>
                          Hozzárendelt dal:
                        </label>
                        <button
                          className='text-sm text-color-acc bg-transparent border-none font-bold underline'
                          style={{ cursor: 'pointer' }}
                          onClick={() =>
                            setActiveSongAddingUserId(
                              activeSongAddingUserId === person.id
                                ? null
                                : person.id,
                            )
                          }
                        >
                          {activeSongAddingUserId === person.id
                            ? 'Bezár'
                            : '➕ Új dal a DB-be'}
                        </button>
                      </div>

                      {/* Dalválasztó legördülő menü (Select) */}
                      {activeSongAddingUserId !== person.id ? (
                        <select
                          className='p-8 b-radius-5 bg-grey text-color-bg font-bold border-none w-100'
                          value={performerSongs[person.id] || ''}
                          onChange={(e) =>
                            handleSelectSongForPerformer(
                              person.id,
                              e.target.value,
                            )
                          }
                          style={{ cursor: 'pointer' }}
                        >
                          <option value=''>
                            -- Válassz dalt a repertoárból --
                          </option>
                          {allSongs.map((song) => (
                            <option key={song.id} value={song.id}>
                              {song.artist} - {song.title}
                            </option>
                          ))}
                        </select>
                      ) : (
                        /* Inline új dal hozzáadása panelek */
                        <div className='p-8 border-sm border-acc b-radius-5 flex flex-column gap-8 bg-bg mt-4'>
                          <div className='text-sm font-bold text-color-acc'>
                            Új dal felvitele a rendszerbe:
                          </div>
                          <input
                            type='text'
                            placeholder='Előadó / Előadók'
                            className='p-6 b-radius-5 bg-grey text-color-bg border-none text-sm font-bold'
                            value={newSongArtist}
                            onChange={(e) => setNewSongArtist(e.target.value)}
                          />
                          <input
                            type='text'
                            placeholder='Dal címe'
                            className='p-6 b-radius-5 bg-grey text-color-bg border-none text-sm font-bold'
                            value={newSongTitle}
                            onChange={(e) => setNewSongTitle(e.target.value)}
                          />
                          <button
                            className='py-6 bg-acc text-color-white font-bold b-radius-5 border-none text-sm'
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCreateAndAddSong(person.id)}
                          >
                            Dal mentése és kiválasztása
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

'use client'
import React, {useState, useEffect} from "react"
import { useRouter } from 'next/navigation'
import { searchArticles, fetchArticles, deleteArticles, getTotalUnapprovedArticles, setArticlesApproval } from "../../firebase/articleUtils/articleUtils"
import { fetchGoogleAnalyticsReport, ApiSignIn } from "../../firebase/analitics/analyticsUtils"
import { makeStyles } from '@material-ui/core/styles';
import Header from "../../components/TextComponents/Header1"
import NeoButton from "../../components/TextComponents/NeoButton"
import { FaPen } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io"
import { RiSearchFill } from "react-icons/ri"
import { MdOutlineDownloadDone, MdOutlinePreview,  MdClose, MdDone, MdArticle, MdAccountCircle,  MdAnalytics, MdDelete, MdHome  } from "react-icons/md";
import { Checkbox, Badge, Tooltip, Divider, Pagination, Box} from "@mui/material"
import dayjs, { Dayjs } from 'dayjs';
import { addSession, fetchSessions } from "../../firebase/sessionUtils/sessionUtils"
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { BarChart } from '@mui/x-charts';
import LinearProgress from '@mui/material/LinearProgress';
import WorldMap from "../../Maps/mapUtils"
import { placeById} from "@tomtom-international/web-sdk-maps"
import { AnimatePresence, motion } from "framer-motion";

import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebase_app from '/firebase/config';
import { app } from "../../app/firebase";

const auth = getAuth(firebase_app);
const firestore = getFirestore(app);

import Loader from "../../components/loader/loader";

const useStyles = makeStyles((theme) => ({
    customTooltip: {
      // Customize letter-spacing
      letterSpacing: '0.1em', // Adjust as needed
    },
  }));

const Admin = () => {

    const [articles, setArticles] = useState([]);
    const [numUnapproved, setNumUnapproved] = useState();
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPanel, setCurrentPanel] = useState("home");
    //const [isSignedIn, setIsSignedIn] = useState(false)
    const [loading, setLoading] = useState(true);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true)
    const [chartData, setChartData] = useState([])
    const [locationData, setLocationData] = useState([])

    const [locNumber, setLocNumber] = useState([]);
    const [sessionInfo, setSessionInfo] = useState({ID: null, Experation: null});
    const [sessionError, setSessionError] = useState("");
    const [sessionErrorIsVisible, setSessionErrorIsVisible] = useState(false);
    const [sessions, setSessions] = useState([])
    const [userId, setUserId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const propertyId = process.env.NEXT_PUBLIC_PROPERTY_ID;
    
    const router = useRouter()

    const classes = useStyles();

    // this code works just throws an error with Rendered more hooks than during the previous render. 
    // const [isAdmin, setIsAdmin] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //     if (user) {
    //         const docRef = doc(firestore, 'users', user.uid);
    //         const docSnap = await getDoc(docRef);
    //         if (docSnap.exists()) {
    //         const userData = docSnap.data();
    //         setIsAdmin(userData.adminPerm === true);
    //         setIsLoading(false);
    //         } else {
    //         setIsLoading(false);
    //         console.log("No such document!");
    //         }
    //     } else {
    //         setIsLoading(false);
    //         router.push('/login');
    //     }
    //     });

    //     return () => unsubscribe();
    // }, []);

    // if (isLoading) {
    //     return <div>Loading...</div>;
    // }

    // if (!isAdmin) {
    //     return <div>Unauthorized Access</div>;
    // }

    const handleFetchArticles = async () => {
        setArticles(await fetchArticles());
        setNumUnapproved(await getTotalUnapprovedArticles());
        setLoading(false)
    };

    const handleSearchArticles = async (search) => {
        setArticles(await searchArticles(search))
    }

    useEffect(() => {
        if (search.trim() === "") {
            handleFetchArticles();
            console.log(articles)
        } else {
            handleSearchArticles(search);
        }
    }, [search]);

    const handleSearchChange = (e) => {
        e.preventDefault()
        setSearch(e.target.value);
    }

    const handleSelection = (id) => {
        setSelectedArticles(prevSelected => prevSelected.includes(id) ? prevSelected.filter(articleId => articleId !== id) : [...prevSelected, id]);
    }

    const handleSelectAll = () => {
        setSelectedArticles(selectedArticles.length < articles.length ? articles.map(article => article.id) : []);
    }

    const handleDeleteArticles = async () => {
        deleteArticles(selectedArticles)
        setSelectedArticles([]);
        const tempArticles = await fetchArticles();
        console.log(tempArticles)
        setArticles(tempArticles); // Refresh articles list after deletion
    };

    const handleSetArticlesApproved = async () => {
        await setArticlesApproval(selectedArticles, true);
        setArticles(await fetchArticles());
        setNumUnapproved(await getTotalUnapprovedArticles());
        setSelectedArticles([])
    }

    
    const handleSetArticlesUnapproved = async () => {
        await setArticlesApproval(selectedArticles, false);
        setArticles(await fetchArticles());
        setNumUnapproved(await getTotalUnapprovedArticles());
        setSelectedArticles([])
    }

    // const handleSignIn = async () => {
    //     await ApiSignIn();
    //     setIsSignedIn(true); // Update the state based on actual sign-in status
    // };

    const handleGenerateSession = () => {
        setSessionInfo({ID: Math.random().toString(36).substr(2, 6), Experation: sessionInfo.Experation})
    }

    const handleSetSessionDate = (Date) => {
        setSessionInfo({ID: sessionInfo.ID, Experation: Date})
    }

    const handleAddSession = () => {

        if(sessionInfo.Experation !== null && sessionInfo.ID !== null){
            
            addSession(sessionInfo.ID, sessionInfo.Experation, false)
        }else{
            if(sessionInfo.Experation === null && sessionInfo.ID === null){
                setSessionErrorIsVisible(true);
                setSessionError("The ID and experation cannot be blank");
                setTimeout(() => setSessionErrorIsVisible(false), 3000);
            }else if(sessionInfo.Experation === null){
                setSessionErrorIsVisible(true);
                setSessionError("The experation cannot be blank.");
                setTimeout(() => setSessionErrorIsVisible(false), 3000);
            }else{
                setSessionErrorIsVisible(true);
                setSessionError("The ID cannot be blank.");
                setTimeout(() => setSessionErrorIsVisible(false), 3000);
            }
        }
    }

    const handleFetchSessions = async () => {
        const tempSessions = await fetchSessions()
        console.log(tempSessions)
        setSessions(tempSessions)
    }


    function calculateCountryUserPercentage(data) {
        // Initialize a map to hold country totals
        const countryTotals = new Map();
        console.log(data)
        // Calculate total users and accumulate totals by country
        let totalUsers = 0;
        data.forEach(item => {
          const users = parseInt(item.number, 10);
          totalUsers += users;
          if (countryTotals.has(item.country)) {
            countryTotals.set(item.country, countryTotals.get(item.country) + users);
          } else {
            countryTotals.set(item.country, users);
          }
        });
      
        // Convert to desired output format with percentage calculation
        const result = Array.from(countryTotals).map(([country, numUsers]) => ({
          country,
          percentage: (numUsers / totalUsers * 100).toFixed(2),
          numUsers
        }));
      
        return result;
      }

    const handleFetch = async () => {
        const {pivotReport, realTimeReport} = await fetchGoogleAnalyticsReport(propertyId)
        // setLocNumber(calculateCountryUserPercentage(pivotReport.result))
        setLocationData(pivotReport)
        setChartData(realTimeReport)
        
    }

    useEffect(() => {
        handleFetchSessions();
        handleFetch()
    }, [])



    const ArticlePanel = () => {
        const [currentPage, setCurrentPage] = useState(1);
        const articlesPerPage = 25; // Now displaying 2 articles per page
    
        // Calculate the indices of the articles to display
        const indexOfLastArticle = currentPage * articlesPerPage;
        const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
        const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
    
    
        // Handle page change
        const handleChangePage = (event, newPage) => {
            setCurrentPage(newPage);
        };

        return(
            <div className="flex flex-col h-full w-full justify-between p-7">
                <div className="flex flex-col gap-[25px] w-full">
                    <div className="w-full flex flex-col gap-[28px] sm:gap-[15px] sm:flex-row sm:gap-0 justify-between">
                        <div className="w-full sm:w-max h-full flex gap-[15px]">
                            <RiSearchFill style={{fontSize: "30px"}} role="link"/> 
                            <input type="search" name="search" required minLength="4" className="neo-input grow sm:w-[180px]" value={search} onChange={(e) => handleSearchChange(e)}/>
                        </div>
                        <Divider   className="flex sm:hidden" flexItem />
                        <div className="w-full flex sm:w-max ">
                            <div className="flex w-full justify-between gap-[15px]">
                                <div className="flex justify-between">  
                                    <Tooltip classes={{ tooltip: classes.customTooltip }} title="Approve">
                                        <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesApproved()}>
                                            <MdDone className="text-2.5xl items-center"/>
                                        </button >
                                    </Tooltip>
                                    <Tooltip classes={{ tooltip: classes.customTooltip }} title="Unapprove">
                                        <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesUnapproved()}>
                                            <MdClose className="text-2.5xl" />
                                        </button>  
                                    </Tooltip>
                                    <Tooltip classes={{ tooltip: classes.customTooltip }} title="Delete">
                                        <button className="w-[35px]  flex justify-center items-center" onClick={() => handleDeleteArticles()}>
                                            <MdDelete className="text-2.5xl" />
                                        </button> 
                                    </Tooltip>                    
                                </div>
                                <NeoButton classes="bg-primary-dark" onClick={handleSelectAll}>
                                    Select All
                                </NeoButton>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-max">
                        {
                            numUnapproved > 0
                            ?
                            `You have ${numUnapproved} unapproved ${numUnapproved > 1 ? 'articles' : 'article'}.`
                            :
                            'You are all up to date!'
                        }
                        
                    </div>
                    <div className="w-full h-max flex flex-wrap 2xl:flex-col gap-[15px]">
                        {
                            currentArticles
                            &&
                            currentArticles.map((article) => (
                                    <div className={`w-full h-max sm:w-[calc(100%_/_2)]  md:w-max 2xl:w-full rounded-md h-full 2xl:h-[50px] border-3 overflow-hidden flex flex-col 2xl:flex-row text-lg ${selectedArticles.includes(article.id) && 'bg-[#c8c8c8]'}`} key={article.id} onClick={() => handleSelection(article.id)}>
                                        <div className="flex w-full md:w-max 2xl:grow grow 2xl:h-full flex-col 2xl:flex-row">
                                            <div className="flex grow w-full md:w-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                                {article.Publisher}
                                            </div>
                                            <Divider orientation="vertical"   className="hidden 2xl:flex" flexItem />
                                            <Divider   className="flex 2xl:hidden" flexItem />
                                            <div className="flex h-full w-full md:w-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                                {article.Author}
                                            </div>
                                            <Divider orientation="vertical"   className="hidden 2xl:flex" flexItem />
                                            <Divider   className="flex 2xl:hidden" flexItem />
                                            <div className="flex h-full w-full md:w-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                                {article.Title}
                                            </div>
                                            <Divider orientation="vertical"   className="hidden 2xl:flex" flexItem />
                                            <Divider   className="flex 2xl:hidden" flexItem />
                                            <div className="flex h-full w-full md:w-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center min-h-[50px]">
                                                {article.Time} 
                                            </div>
                                            <Divider orientation="vertical" className="hidden 2xl:flex" flexItem />
                                            <Divider   className="flex 2xl:hidden" flexItem />
                                            <div className="flex h-full w-full md:w-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center min-h-[50px]">
                                                Date here
                                            </div>
                                            <Divider orientation="vertical"   className="hidden 2xl:flex" flexItem />
                                            <Divider   className="flex 2xl:hidden" flexItem />
                                            <div className="flex h-full w-full md:w-[200px] flex items-center py-[15px] pl-[10px] min-h-[50px]">
                                                No Cover Image Available
                                            </div>
                                            <div className={`h-full w-full md:w-[200px] 2xl:grow flex border-y-3 2xl:border-x-3 2xl:border-y-0 pl-[10px] py-[15px] items-center ${article.Approved ? "bg-primary-dark" : "bg-[#fd6666]"}`}>
                                                {
                                                    article.Approved
                                                    ?
                                                    "Approved"
                                                    :
                                                    "Unapproved"
                                                }
                                            </div>
                                        </div>
                                        <div className="flex h-full w-full 2xl:w-max p-[10px] max-h-[39px] 2xl:max-h-full 2xl:gap-[10px] justify-between">
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Edit">
                                                <button onClick={() => router.push(`/editor/${article.id}`)} >
                                                    <FaPen className="text-xl w-[25px]"/>
                                                </button>
                                            </Tooltip>
                                            <Divider orientation="vertical" flexItem />
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="View">
                                                <button>
                                                    <MdOutlinePreview className="text-2xl w-[25px]" />
                                                </button>
                                            </Tooltip>
                                        </div>
                                    </div>
                            ))
                        }            
                    </div>

                </div>
                {
                    (Math.ceil(articles.length / articlesPerPage) > 1)
                    &&
                    <div className="w-full flex justify-center h-max">
                        <Pagination count={Math.ceil(articles.length / articlesPerPage)} page={currentPage} onChange={handleChangePage} variant="outlined" shape="rounded"   sx={{'& .MuiButtonBase-root': { borderWidth: '2px', borderRadius: '5px', borderColor: 'black' }}}  />
                    </div>
                }

            </div>
        )
    }


    const AnalyticsPanel = () => {

        return(
            <>
                <div className="flex w-full h-max ">
                    <div className="w-0 h-full flex items-center py-7">
                        {
                            chartData !== undefined
                            &&
                            <div className="w-max h-full p-7 relative left-[25px] bg-base-100 rounded-md flex flex-col justify-start gap-[15px] border-3 z-10">
                                <span className="text-lg underline decoration-dashed">
                                    USERS IN LAST 30 MINUTES.
                                </span>
                                <span className="text-3xl">
                                    1
                                </span>
                                <span className="text-lg underline decoration-dashed">
                                    USERS PER MINUTE
                                </span>
                                <BarChart
                                    width={350}

                                    height={100}
                                    dataset={chartData.result}

                                    yAxis={[{label: "Number of Users"}]}
                                    xAxis={[{scaleType: 'band', dataKey: "time", valueFormatter}]}
                                    series={[{ dataKey: 'numUsers', valueFormatter}]}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                />
                                <div className="w-full flex justify-between">
                                    <span className="text-lg underline decoration-dashed">
                                        TOP 3 COUNTRIES.
                                    </span>
                                    <span className="text-lg underline decoration-dashed">
                                        USERS
                                    </span>
                                </div>
                                {
                                    locNumber.map((data) => (
                                        <>
                                            <div className="w-full flex justify-between">
                                                <span className="text-lg decoration-dashed">
                                                    {data.country}
                                                </span>
                                                <span className="text-lg decoration-dashed">
                                                    {data.numUsers}
                                                </span>
                                            </div>
                                            <LinearProgress  variant="determinate" value={data.percentage}/>
                                        </>
                                    ))
                                }

                            </div>
                        }
                    </div>
                    <WorldMap className="w-full" locationData={locationData.result}/>
                </div>
            </>
        )
    };

    const [selectedSession, setSelectedSession] = useState();

    const HomePanel = () => {

        return(
            <>
                <div className="h-full w-full grid grid-cols-4 grid-rows-4 gap-7 p-7">
                    <div className="col-span-4  2xl:col-span-1 2xl:row-span-4 rounded-md border-3 flex justify-between 2xl:flex-col p-[15px]  pb-0 gap-7">
                        <div className="flex flex-col gap-[15px] w-[40%] pb-[20px] 2xl:w-full 2xl:pb-0 h-max">
                            <div className="w-full h-max ">
                                <Header type="sm" >
                                    Class Session
                                </Header>
                            </div>
                            <span className="text-lg underline decoration-dashed">
                                Session ID
                            </span>
                            <span className="text-xl">
                                {
                                    sessionInfo.ID
                                    ?
                                    <>
                                        {sessionInfo.ID}
                                    </>
                                    :
                                    <>
                                        No ID generated.
                                    </>
                                }
                            </span>
                            <span className="text-lg underline decoration-dashed">
                                Expiration
                            </span>
                            <div className="h-max">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                    label="Basic date picker"
                                    defaultValue={sessionInfo.Experation}
                                    onChange={(newValue) => handleSetSessionDate(newValue)}
                                    slotProps={{ textField: { size: 'small' } }}
                                    renderInput={(params) => <TextField size="small" {...params} />}
                                    />
                                </ LocalizationProvider>
                            </div>
                            <div className="flex justify-between">
                                <NeoButton classes="bg-primary" onClick={() => handleGenerateSession()}>
                                    New Session
                                </NeoButton>
                                <NeoButton classes="bg-primary-dark" onClick={() => handleAddSession()}>
                                    Save
                                </NeoButton>
                            </div>
                            <AnimatePresence>
                                {sessionErrorIsVisible && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-md p-[15px]"
                                        style={{ background: '#fd6666', color: "black", marginTop: "15px"}}
                                    >
                                        {sessionError}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </div>
                        <div className="grow flex flex-col w-[30%] 2xl:w-full">
                            <div className={`flex justify-between w-full h-max px-[15px] py-[5px] items-center text-lg `}>
                                <div className="flex-1 underline decoration-dashed">
                                    Session ID
                                </div>
                                <div className="flex-1 px-[15px] underline decoration-dashed">
                                    Experation
                                </div>
                                <div className="flex-1 text-right underline decoration-dashed">
                                    Is Expired
                                </div>
                            </div>
                            <div className="flex w-full grow flex flex-col text-lg bg-base-200 rounded-t-md  border-3 border-b-0">
                                {
                                    sessions
                                    ?
                                    <>
                                        {
                                            sessions.map((data, index) => (
                                                <div className={`flex justify-between w-full h-max px-[15px] py-[5px] border-b-3 bg-base-100 items-center ${(index === 0 && "rounded-t-md")}`} onClick={() => setSelectedSession(data.id)}>
                                                    <div className="flex-1">
                                                        {data.id}
                                                    </div>
                                                    <Divider orientation="vertical" />
                                                    <div className="flex-1 px-[15px]">
                                                        {data.Experation}
                                                    </div>
                                                    <Divider orientation="vertical" />
                                                    <div className="flex-1 text-right">
                                                        {data.IsExpired ? "Yes" : "No"}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </>
                                    :
                                    <>
                                        NO DATA!
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    <div class="col-span-4 2xl:col-span-3 2xl:row-span-2 rounded-md border-3 flex p-[15px] pb-0 gap-[25px] text-lg">
                        <div className="flex flex-col grow gap-[15px]">
                            <Header type="sm" >
                                Class Session
                            </Header>
                            <span className="text-lg underline decoration-dashed">
                                Selected Session ID
                            </span>
                            <span className="text-lg">
                                {
                                    selectedSession
                                    ?
                                    selectedSession
                                    :
                                    "No Session has been selected"
                                }
                            </span>
                            <div className="w-full grow flex ">
                                <div className="h-full w-[200px] flex text-center flex-col justify-center">
                                    <span className="text-lg underline decoration-dashed">
                                        Users This Session
                                    </span>
                                    <div className="w-full h-max text-7xl">
                                        10
                                    </div>
                                </div>
                                <div className="h-full w-[200px] flex text-center flex-col justify-center">
                                    <span className="text-lg underline decoration-dashed">
                                        User Submittions
                                    </span>
                                    <div className="w-full h-max text-7xl">
                                        5
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full flex flex-col w-[60%] gap-[25px]">
                            <div className="w-full flex flex-col gap-[28px] sm:gap-[15px] sm:flex-row sm:gap-0 justify-end">
                                <div className="w-full flex sm:w-max ">
                                    <div className="flex w-full justify-between gap-[15px]">
                                        <div className="flex justify-between">  
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Approve">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesApproved()}>
                                                    <MdDone className="text-2.5xl items-center"/>
                                                </button >
                                            </Tooltip>
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Unapprove">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesUnapproved()}>
                                                    <MdClose className="text-2.5xl" />
                                                </button>  
                                            </Tooltip>
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Delete">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleDeleteArticles()}>
                                                    <MdDelete className="text-2.5xl" />
                                                </button> 
                                            </Tooltip>                    
                                        </div>
                                        <NeoButton classes="bg-primary-dark" onClick={handleSelectAll}>
                                            Select All
                                        </NeoButton>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col grow gap-[15px]">
                                <div className="w-full flex h-min">
                                    <div className="flex grow w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        First Name
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Last Name
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Session ID
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Has Submitted
                                    </div>
                                </div>
                                <div className="flex w-full grow flex flex-col text-lg bg-base-200 rounded-t-md  border-3 border-b-0">
                                    <div className={`flex justify-between w-full h-max border-b-3 bg-base-100 items-center rounded-t-md`}>
                                        <div className="flex grow md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                            First Name
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className="hidden md:flex basis-[200px] py-[15px] 2xl:py-0 pl-[10px] min-h-[50px] items-center">
                                            Last Name
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className="hidden md:flex basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center min-h-[50px]">
                                            Session ID
                                        </div>
                                        <Divider orientation="vertical"/>
                                        <div className={`hidden md:flex basis-[200px] 2xl:grow pl-[10px] py-[15px] items-center`}>
                                            No Article
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-4 2xl:col-span-3 2xl:row-span-2 rounded-md border-3 flex p-[15px] pb-0 gap-[25px] text-lg">
                        <div className="flex flex-col grow gap-[15px]">
                            <Header type="sm" >
                                Class Session
                            </Header>
                            <span className="text-lg underline decoration-dashed">
                                Selected Session ID
                            </span>
                            <span className="text-lg">
                                {
                                    selectedSession
                                    ?
                                    selectedSession
                                    :
                                    "No Session has been selected"
                                }
                            </span>
                            <div className="w-full grow flex ">
                                <div className="h-full w-[200px] flex text-center flex-col justify-center">
                                    <span className="text-lg underline decoration-dashed">
                                        Articles This Session
                                    </span>
                                    <div className="w-full h-max text-7xl">
                                        10
                                    </div>
                                </div>
                                <div className="h-full w-[200px] flex text-center flex-col justify-center">
                                    <span className="text-lg underline decoration-dashed">
                                        Articles Pending Approval
                                    </span>
                                    <div className="w-full h-max text-7xl">
                                        5
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full flex flex-col w-[60%] gap-[25px]">
                            <div className="w-full flex flex-col gap-[28px] sm:gap-[15px] sm:flex-row sm:gap-0 justify-end">
                                <div className="w-full flex sm:w-max ">
                                    <div className="flex w-full justify-between gap-[15px]">
                                        <div className="flex justify-between">  
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Approve">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesApproved()}>
                                                    <MdDone className="text-2.5xl items-center"/>
                                                </button >
                                            </Tooltip>
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Unapprove">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleSetArticlesUnapproved()}>
                                                    <MdClose className="text-2.5xl" />
                                                </button>  
                                            </Tooltip>
                                            <Tooltip classes={{ tooltip: classes.customTooltip }} title="Delete">
                                                <button className="w-[35px]  flex justify-center items-center" onClick={() => handleDeleteArticles()}>
                                                    <MdDelete className="text-2.5xl" />
                                                </button> 
                                            </Tooltip>                    
                                        </div>
                                        <NeoButton classes="bg-primary-dark" onClick={handleSelectAll}>
                                            Select All
                                        </NeoButton>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex flex-col grow gap-[15px]">
                                <div className="w-full flex h-min">
                                    <div className="flex grow w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Publisher
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Title
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Date
                                    </div>
                                    <div className="flex h-max w-full md:basis-[200px] py-[15px] 2xl:py-0 pl-[10px] items-center underline decoration-dashed">
                                        Approval
                                    </div>
                                    <div className="flex h-full min-w-[90px] p-[10px] max-h-[39px] 2xl:max-h-full 2xl:gap-[10px] justify-between">

                                    </div>
                                </div>
                                <div className="flex w-full grow flex flex-col text-lg bg-base-200 rounded-t-md  border-3 border-b-0">
                                    {
                                    articles
                                    &&
                                    articles.map((article, index) => (
                                        <div className={`flex justify-between w-full h-max border-b-3 bg-base-100 items-center ${index === 0 ? "rounded-t-md" : ""}`}>
                                            <div className="flex grow md:basis-[200px] py-0 pl-[10px] min-h-[50px] items-center">
                                                {article.Publisher}
                                            </div>
                                            <Divider orientation="vertical"/>
                                            <div className="hidden md:flex basis-[200px] py-0 pl-[10px] min-h-[50px] items-center">
                                                {article.Title}
                                            </div>
                                            <Divider orientation="vertical"/>
                                            <div className="hidden md:flex basis-[200px]  py-0 pl-[10px] items-center min-h-[50px]">
                                                Date here
                                            </div>
                                            <div className={`hidden md:flex basis-[200px] grow border-y-3 border-x-3 border-y-0 h-full pl-[10px] items-center ${article.Approved ? "bg-primary-dark" : "bg-[#fd6666]"} `}>
                                                {article.Approved ? "Approved" : "Unapproved"}
                                            </div>
                                            <div className="flex h-full w-full w-max p-[10px] max-h-[39px] max-h-full gap-[10px] justify-between">
                                                <Tooltip classes={{ tooltip: classes.customTooltip }} title="Edit">
                                                    <button onClick={() => router.push(`/editor/${article.id}`)} >
                                                        <FaPen className="text-xl w-[25px]"/>
                                                    </button>
                                                </Tooltip>
                                                <Divider orientation="vertical"/>
                                                <Tooltip classes={{ tooltip: classes.customTooltip }} title="View">
                                                    <button>
                                                        <MdOutlinePreview className="text-2xl w-[25px]" />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const valueFormatter = (value) => `${value} Users`;


    return(
        <div className="h-max min-h-[calc(100vh_-_67px)] w-full flex pt-[67px]">
            <div className={`flex  ${isSideBarOpen ? 'w-max border-r-3' : 'w-0'}`}>
                <div className={`flex flex items-end h-[calc(100vh_-_80px)] ${isSideBarOpen ? 'w-max' : 'w-0'}`}>
                    <div className={`h-full dark:bg-base-dark  lg:w-[250px]  flex flex-col  gap-[25px] items-start 2xl:items-center 3xl:items-start overflow-hidden ${isSideBarOpen ? "w-max 2xl:min-w-max px-[25px] lg:pl-[50px]  2xl:pl-[25px] py-[152px]" : "w-0" }`}>
                        <button className="flex items-center gap-[15px] w-full" onClick={() => setCurrentPanel("home")}>
                            <Badge badgeContent={0} color="primary">
                                <MdHome className="text-2.7xl" /> 
                            </Badge>
                            <span className="hidden lg:inline">
                                Home
                            </span>
                        </button>
                        <button className="flex items-center gap-[15px] w-full" onClick={() => setCurrentPanel("analytics")}>
                            <Badge badgeContent={0} color="primary">
                                <MdAnalytics  className="text-2.7xl" /> 
                            </Badge>
                            <span className="hidden lg:inline">
                                Analytics
                            </span>
                        </button>
                        <button className="flex items-center gap-[15px] w-full" onClick={() => setCurrentPanel("users")}>
                            <Badge badgeContent={0} color="primary">
                                <MdAccountCircle className="text-2.7xl" /> 
                            </Badge>
                            <span className="hidden lg:inline">
                                Users
                            </span>
                        </button>
                        <button className="flex items-center gap-[15px] w-full" onClick={() => setCurrentPanel("articles")}>
                            <Badge badgeContent={numUnapproved} color="primary">
                                <MdArticle className="text-2.7xl"/> 
                            </Badge>
                            <span className="hidden lg:inline">
                                Articles
                            </span>
                        </button>
                    </div>
                    <div className='w-0 h-[45px] py-[2px] z-10'>
                        <div className={` relative rounded-r w-[30px] justify-center w-[30px] ${isSideBarOpen && "rounded-l rounded-r"}  h-full flex items-center  bg-base-300`} onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
                            {
                                (isSideBarOpen)
                                ?
                                <IoIosArrowBack className="text-t-header-dark text-2xl " />
                                :
                                <IoIosArrowForward className="text-t-header-dark text-2xl"/>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="grow min-h-full  flex flex-col">
                <div className="w-full h-max border-b-3 flex items-center p-7">
                    <Header type="lg" classes="w-full">
                        {
                        (currentPanel === "articles")
                        ?
                        <>
                            Article Console.
                        </>
                        :
                        <>
                            {
                                (currentPanel === "analytics")
                                ?
                                <>
                                    Analytics.
                                </>
                                :
                                <>
                                    {
                                        (currentPanel === "home")
                                        &&
                                        <>
                                            Home.
                                        </>
                                    }
                                </>
                            }
                        </>
                        }
                    </Header>
                </div>
                <div className="h-full w-full flex flex-col items-center gap-[15px]">
                    {
                        (currentPanel === "articles")
                        &&
                        <ArticlePanel />
                    }
                    {
                        (currentPanel === "analytics")
                        &&
                        <AnalyticsPanel />
                    }
                    {
                        (currentPanel === "home")
                        &&
                        <HomePanel />
                    }
                </div>
            </div>
        </div>
    )
}

export default Admin;
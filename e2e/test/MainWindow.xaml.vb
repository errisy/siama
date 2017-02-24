Imports OpenQA.Selenium.Chrome, OpenQA.Selenium.Support.UI, OpenQA.Selenium

Imports Newtonsoft.Json
Imports System.Text.RegularExpressions
Imports System.ComponentModel

Class MainWindow

    Public TestLogs As New System.Collections.ObjectModel.ObservableCollection(Of TestLog)


    Public Libraries As Library()
    Public Computers As ComputerAavailability()
    Private Sub MainWindow_Loaded(sender As Object, e As RoutedEventArgs) Handles Me.Loaded
        gdLog.ItemsSource = TestLogs
        Chrome = New ChromeDriver

        'download back end data

        Dim wc As New System.Net.WebClient
        Dim setting = New JsonSerializerSettings With {.NullValueHandling = NullValueHandling.Ignore, .MissingMemberHandling = MissingMemberHandling.Ignore}
        Dim hours = wc.DownloadString("http://app.library.uq.edu.au/api/v2/library_hours/day")
        Libraries = JsonConvert.DeserializeObject(Of HoursObject)(hours, setting).locations
        Dim coms = wc.DownloadString("https://app.library.uq.edu.au/api/computer_availability")
        Computers = JsonConvert.DeserializeObject(Of ComputerAavailability())(coms, setting)
    End Sub

    Private Sub MainWindow_Closing(sender As Object, e As CancelEventArgs) Handles Me.Closing
        'close both the browser and chrome driver at the end of test
        Chrome.Quit()
    End Sub

    Public Chrome As ChromeDriver

    Public Sub Log(Action As String, Optional Comment As String = "", Optional Result As String = "", Optional Failed As String = "", Optional ActionBrush As Brush = Nothing)
        If ActionBrush Is Nothing Then ActionBrush = Brushes.White
        Dim log = New TestLog With {.Action = Action, .Comment = Comment, .Result = Result, .Failed = Failed, .ActionBrush = ActionBrush}
        TestLogs.Add(log)
    End Sub

    Public Sub WaitUntil(Condition As Func(Of IWebDriver, IWebElement), Optional ErrorMessage As String = "Wait Timeout", Optional Seconds As Integer = 10)
        Try
            Dim wait = New WebDriverWait(Chrome, New TimeSpan(0, 0, Seconds))
            wait.Until(Condition)
        Catch ex As Exception
            Log(ErrorMessage)
        End Try
    End Sub
    Public Sub BeginTest(Optional Name As String = "")
        Log("--- Begin", Name,,, Brushes.Red)
    End Sub
    Public Sub EndTest(Optional Name As String = "")
        Log("--- End", Name,,, Brushes.Blue)
        Log("")
    End Sub
    Public Sub ResetURL()
        Chrome.Url = "about:blank"
        Chrome.Navigate()
    End Sub

    Private Sub ViewReport(sender As Object, e As RoutedEventArgs)
        BeginTest("View Report")
        ResetURL()
        Dim url = "http://localhost/report"

        Log("Navigate to URL: ", url)
        Chrome.Url = url
        Chrome.Navigate()

        Log("wait until the report is visible")
        WaitUntil(ExpectedConditions.ElementIsVisible(By.XPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/legend")))
        Log("Number of report", "Should be 1", Chrome.FindElementsByTagName("fieldset").Count, 1 = Chrome.FindElementsByTagName("fieldset").Count)

        EndTest("View Report")
    End Sub

    Private Sub EditReport(sender As Object, e As RoutedEventArgs)
        BeginTest("Edit Report")
        ResetURL()
        Dim url = "http://localhost/report"

        Log("Navigate to URL: ", url)
        Chrome.Url = url
        Chrome.Navigate()

        Log("wait until the report is visible")
        WaitUntil(ExpectedConditions.ElementIsVisible(By.XPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[1]/div")))


        Dim EditDiv = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[1]/div")

        EditDiv.Click()

        Dim InspectionNo = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[1]/input")

        Dim InspectionDate = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[2]/input")

        Dim StructureNo = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[3]/input")


        Log("modify values")

        Dim _InsNo = "242458B"
        Dim _InsDate = "26/02/2016"
        Dim _StrNo = "242458"
        InspectionNo.Clear()
        InspectionNo.SendKeys(_InsNo)
        InspectionDate.Clear()
        InspectionDate.SendKeys(_InsDate)
        StructureNo.Clear()
        StructureNo.SendKeys(_StrNo)

        Dim FileUploader = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[3]/div[2]/input")

        FileUploader.SendKeys(AppDomain.CurrentDomain.BaseDirectory + "\sample.jpg")

        Dim Submit = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[6]/div[3]")

        Log("save valus")
        Submit.Click()
        Submit.Click()


        Dim js As IJavaScriptExecutor = Chrome
        js.ExecuteScript("arguments[0].click();", Submit)

        Log("wait 3 seconds to complete submit")

        Try
            Dim wait = New WebDriverWait(Chrome, New TimeSpan(0, 0, 3))

            wait.Until(ExpectedConditions.ElementExists(By.Id("notexist")))
        Catch ex As Exception

        End Try

        Dim DashBoard = Chrome.FindElementByXPath("/html/body/div/div[2]/div[1]/div[2]/div[1]")

        Log("Open Dashboard")
        DashBoard.Click()
        Log("wait until the 'Page Available Soon' is visible")
        WaitUntil(ExpectedConditions.ElementIsVisible(By.XPath("/html/body/div/div[2]/div[2]/ui-pagenotfound/div[2]")))

        Log("Load Report Again")
        Dim Report = Chrome.FindElementByXPath("/html/body/div/div[2]/div[1]/div[2]/div[3]")
        Report.Click()
        Log("wait until the report is visible")
        WaitUntil(ExpectedConditions.ElementIsVisible(By.XPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[1]/div")))

        Log("find the fields again")
        InspectionNo = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[1]/input")

        InspectionDate = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[2]/input")

        StructureNo = Chrome.FindElementByXPath("/html/body/div/div[2]/div[2]/ui-report/form/fieldset/div[2]/div[3]/input")

        Log("InspectionNo", "Should be " + _InsNo, InspectionNo.GetAttribute("value"), _InsNo = InspectionNo.GetAttribute("value"))
        Log("InspectionDate", "Should be " + _InsDate, InspectionDate.GetAttribute("value"), _InsDate = InspectionDate.GetAttribute("value"))
        Log("StructureNo", "Should be " + _StrNo, StructureNo.GetAttribute("value"), _StrNo = StructureNo.GetAttribute("value"))

        EndTest("Edit Report")
    End Sub
End Class

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Announcements from "@/pages/Announcements";
import Ranks from "@/pages/Ranks";
import Rules from "@/pages/Rules";
import WeeklyTasks from "@/pages/WeeklyTasks";
import AcademyApply from "@/pages/AcademyApply";
import Apply from "@/pages/Apply";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        <Layout>
          <Home />
        </Layout>
      </Route>
      
      <Route path="/announcements">
        <Layout>
          <Announcements />
        </Layout>
      </Route>
      
      <Route path="/ranks">
        <Layout>
          <Ranks />
        </Layout>
      </Route>
      
      <Route path="/rules">
        <Layout>
          <Rules />
        </Layout>
      </Route>
      
      <Route path="/academy-apply">
        <Layout>
          <AcademyApply />
        </Layout>
      </Route>

      <Route path="/apply">
        <Layout>
          <Apply />
        </Layout>
      </Route>
      
      <Route path="/admin">
        <Layout>
          <Admin />
        </Layout>
      </Route>
      
      <Route path="/rules" component={Rules} />
      <Route path="/weekly-tasks" component={WeeklyTasks} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

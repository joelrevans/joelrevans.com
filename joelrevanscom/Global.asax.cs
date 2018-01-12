﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace joelrevanscom
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
        }

        public override string GetVaryByCustomString(HttpContext context, string custom)
        {
            if (custom == "VaryByTarget")
            {
                return (string)context.Request.RequestContext.RouteData.Values["target"];
            }
            return null;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.Mvc;
using System.Web.Caching;
using System.Net;
using System.IO;

namespace joelrevanscom.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        [OutputCache(Duration = 3600 * 24 * 14, VaryByCustom = "VaryByTarget", Location=OutputCacheLocation.ServerAndClient)]
        public ActionResult Index()
        {
            string target = (string)Request.RequestContext.RouteData.Values["target"];
            return target == null ? View() : View(target); 
        }
    }
}
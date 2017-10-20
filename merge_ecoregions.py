#A function to read forest area, gain and loss csv data and write out to single table
#Requirements: numpy, os, operator

import numpy as np
import os
from operator import itemgetter

def read_me(file):

    """
    Read the csv file, find ecoregion ID and associated data (forest area, loss, gain)
    :param file: input file name to load
    :return: ecoregion id and data (area, loss, gain)

    """

    #initiate the data lists
    id = []
    ddata = []

    #open the csv file
    with open(file) as f:
        lines = f.readlines()
        for line in lines[1:]:
            data = line.split(',')
            id_tmp = data[3]
            #load the id
            id.append(np.float(id_tmp))
            #load the data
            try:
                data_tmp = np.float(data[25])
                ddata.append(data_tmp)
            except ValueError:
                data_tmp = np.float(data[24])
                ddata.append(data_tmp)

    return id, ddata

def do_all(folder):

    """
    Do for all ecoregions; forest area, forest gain, forest loss.
    Load all data for each ecoregion (and associated ID) and save as a single table.
    :param folder: Define folder with all the data files
    :return: Saved csv file.

    """

    #initiate the data lists
    id = []
    area = []
    loss = []
    gain = []

    unique_file_name = []

    #find the seperate files for area (e.g. north am, europe)
    for _, _, files in os.walk(folder):
        for f in files:
            if "cover" in f:
                un = f.split("cover")[0][:-1]
            if "loss" in f:
                un = f.split("loss")[0][:-1]
            if "gain" in f:
                un = f.split("gain")[0][:-1]
            unique_file_name.append(un)

    for uni in set(unique_file_name):
        for _, _, files in os.walk(folder):
            for f in files:

                #extend id and forest area list with eco_id and forest area columns from csv
                if "cover" in f and f.startswith(uni):
                    myfile = os.path.join(folder, f)
                    print "Doing %s" %myfile
                    idd, ddata = read_me(myfile)

                    #find the unique ids
                    #some ids have multiple entries due to different geometries
                    unique_id = set(idd)
                    id.extend(unique_id)

                    #find the sum of all entries for a single id
                    for u in unique_id:
                        idx = np.where(np.array(idd)==u)[0]
                        area.extend([np.sum(itemgetter(*idx)(ddata))])

                #extend loss list with forest loss columns from csv
                if "loss" in f and f.startswith(uni):
                    myfile = os.path.join(folder, f)
                    print "Doing %s" % myfile
                    _, ddata = read_me(myfile)
                    for u in unique_id:
                        idx = np.where(np.array(idd)==u)[0]
                        loss.extend([np.sum(itemgetter(*idx)(ddata))])

                #extend gain list with forest gain columns from csv
                if 'gain' in f and f.startswith(uni):
                    myfile = os.path.join(folder, f)
                    print 'Doing %s' % myfile
                    _, ddata = read_me(myfile)
                    for u in unique_id:
                        idx = np.where(np.array(idd)==u)[0]
                        gain.extend([np.sum(itemgetter(*idx)(ddata))])

    #create the table with id, area, gain and loss
    big_table = np.ones([len(id),4])
    big_table[:,0] = id
    big_table[:, 1] = area
    big_table[:, 2] = gain
    big_table[:, 3] = loss

    #write data out to csv file
    outfile = folder + "/ecoregion_forest_tot.csv"
    print "Writing to %s" %outfile
    np.savetxt(outfile, big_table, fmt="%.0f, %.12f, %.12f, %.12f", delimiter=',')

    return

#change the folder containing ecoregion csv files
folder = '/xxx/ECOREGION_FOREST/'
do_all(folder)
